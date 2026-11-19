import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [url, outputDirectory, widthText, heightText, portText, targetTime, fileName] = process.argv.slice(2);
const width = Number(widthText);
const viewportHeight = Number(heightText);
const port = Number(portText);
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profileDirectory = path.join(outputDirectory, `profile-${width}`);

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

fs.rmSync(profileDirectory, {recursive: true, force: true});

const edge = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    `--window-size=${width},${viewportHeight}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--force-color-profile=srgb',
    'about:blank',
], {stdio: 'ignore'});

let pageTarget = null;

for (let attempt = 0; attempt < 50 && pageTarget === null; attempt++) {
    await sleep(300);

    try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();

        pageTarget = targets.find(target => target.type === 'page') ?? null;
    } catch {
        pageTarget = null;
    }
}

if (pageTarget === null) {
    edge.kill();
    throw new Error('Edge did not open a page');
}

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
const pendingReplies = new Map();
const eventWaiters = new Map();
let messageId = 0;

socket.onmessage = event => {
    const message = JSON.parse(event.data);

    if (message.id !== undefined && pendingReplies.has(message.id)) {
        pendingReplies.get(message.id)(message);
        pendingReplies.delete(message.id);
    }

    if (message.method && eventWaiters.has(message.method)) {
        eventWaiters.get(message.method)(message);
        eventWaiters.delete(message.method);
    }
};

await new Promise(resolve => {
    socket.onopen = resolve;
});

const send = (method, params = {}) => new Promise(resolve => {
    messageId += 1;
    pendingReplies.set(messageId, resolve);
    socket.send(JSON.stringify({id: messageId, method, params}));
});

const waitForEvent = method => new Promise(resolve => {
    eventWaiters.set(method, resolve);
});

const evaluate = async expression => (await send('Runtime.evaluate', {expression, returnByValue: true})).result?.result?.value;

const advance = async milliseconds => {
    const expired = waitForEvent('Emulation.virtualTimeBudgetExpired');

    await send('Emulation.setVirtualTimePolicy', {policy: 'advance', budget: milliseconds});
    await expired;
};

const settings = {
    settingsVersion: 2,
    port: 4455,
    isShowGeneralCard: true,
    isShowOutputCards: true,
    language: 'en',
    isAutoUpdateEnabled: false,
    isJournalEnabled: false,
    lastUpdateCheckAt: Date.now(),
    lastNotifiedVersion: '99.0.0',
    isMockEnabled: true,
};

const hideScript = `(() => {
    const style = document.createElement('style');
    style.textContent = '.ant-alert { display: none !important; }';
    document.head.appendChild(style);
    const hideCards = () => {
        document.querySelectorAll('.ant-card').forEach(card => {
            const head = card.querySelector('.ant-card-head');
            if (!head || !/Copy of main|Which platform\\?/.test(head.innerText)) {
                return;
            }
            let item = card;
            while (item.parentElement && getComputedStyle(item.parentElement).display !== 'grid') {
                item = item.parentElement;
            }
            if (item.parentElement) {
                item.style.display = 'none';
            }
        });
    };
    new MutationObserver(hideCards).observe(document.body, {childList: true, subtree: true});
    hideCards();
    return true;
})()`;

const readState = () => evaluate(`(() => {
    const cards = [...document.querySelectorAll('.ant-card')];
    const youtube = cards.find(card => (card.querySelector('.ant-card-head')?.innerText || '').startsWith('YouTube') && !card.innerText.includes('Copy of main'));
    const time = youtube ? ((youtube.innerText.match(/\\d\\d:\\d\\d:\\d\\d/) || [''])[0]) : '';
    const recent = cards.find(card => (card.querySelector('.ant-card-head')?.innerText || '').startsWith('Twitch'));
    const twitchRow = recent ? [...recent.querySelectorAll('.ant-descriptions-item')].find(item => item.innerText.includes('Dropped per minute')) : null;
    return {
        time,
        twitchIcon: Boolean(twitchRow && twitchRow.querySelector('.anticon-exclamation-circle')),
        scrollHeight: document.documentElement.scrollHeight,
        heads: cards.filter(card => card.offsetParent !== null).map(card => (card.querySelector('.ant-card-head')?.innerText || '').split('\\n')[0]),
    };
})()`);

const toSeconds = text => text.split(':').reduce((total, part) => total * 60 + Number(part), 0);

await send('Emulation.setDeviceMetricsOverride', {width, height: viewportHeight, deviceScaleFactor: 1, mobile: false});
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', {url});
await sleep(3000);
await evaluate(`localStorage.setItem('streamoscope.settings', ${JSON.stringify(JSON.stringify(settings))}); true`);
await send('Page.reload');
await sleep(3000);
await evaluate(hideScript);

const targetSeconds = toSeconds(targetTime);

await advance(15000);

let state = await readState();

while (toSeconds(state.time || '00:00:00') < targetSeconds - 3) {
    const gap = targetSeconds - 3 - toSeconds(state.time || '00:00:00');

    await advance(Math.min(Math.max(gap, 1), 60) * 1000);
    state = await readState();
}

while (state.time !== targetTime) {
    if (toSeconds(state.time) > targetSeconds) {
        throw new Error(`overshot: ${state.time}`);
    }

    await advance(1000);
    state = await readState();
}

const shot = await send('Page.captureScreenshot', {format: 'png'});
const filePath = path.join(outputDirectory, fileName);

fs.writeFileSync(filePath, Buffer.from(shot.result.data, 'base64'));
console.log(JSON.stringify({saved: filePath, ...state}));

socket.close();
edge.kill();
