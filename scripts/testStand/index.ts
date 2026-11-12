import {
    BROKEN_PART_FLAGS,
    OPEN_SETTINGS_EXPRESSION,
    USAGE,
} from './consts.ts';
import {captureDock} from './dock/captureDock.ts';
import {evaluateInDock} from './dock/evaluateInDock.ts';
import {sendBridgeCommand} from './obs/sendBridgeCommand.ts';
import {sendObsRequest} from './obs/sendObsRequest.ts';
import {buildNewerRelease} from './packaging/buildNewerRelease.ts';
import {installCurrentVersion} from './packaging/installCurrentVersion.ts';
import {printStatus} from './printStatus.ts';
import {startStand} from './processes/startStand.ts';
import {stopStand} from './processes/stopStand.ts';
import {runScenario} from './scenario/runScenario.ts';
import {setupStand} from './setup/setupStand.ts';

const [command, argument, flag] = process.argv.slice(2);

switch (command) {
    case 'setup':
        await setupStand();
        break;
    case 'install':
        await installCurrentVersion();
        break;
    case 'release':
        await buildNewerRelease(argument, BROKEN_PART_FLAGS[flag]);
        break;
    case 'start':
        await startStand();
        break;
    case 'stop':
        await stopStand();
        break;
    case 'status':
        await printStatus();
        break;
    case 'stream':
        await sendObsRequest(argument === 'off' ? 'StopStream' : 'StartStream');
        break;
    case 'update':
        await sendBridgeCommand(`install:${argument}`);
        break;
    case 'open-settings':
        await evaluateInDock(OPEN_SETTINGS_EXPRESSION);
        break;
    case 'evaluate':
        console.log(await evaluateInDock(argument));
        break;
    case 'screenshot':
        await captureDock(argument);
        break;
    case 'scenario':
        await runScenario();
        break;
    default:
        console.log(USAGE);
}
