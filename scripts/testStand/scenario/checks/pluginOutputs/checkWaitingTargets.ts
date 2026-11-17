import {
    BRIDGE_PARAMETER,
    CONNECTION_WAIT_MS,
    DOCK_WAITING_FOR_FIRST_STREAM_TEXT,
    DOCK_WAITING_FOR_STREAM_TEXT,
    FAKE_MULTI_RTMP_CONFIG,
    FAKE_MULTI_RTMP_ENABLED_TARGETS,
    FAKE_MULTI_RTMP_KEY_PREFIX,
    OUTPUT_FINGERPRINT_PATTERN,
} from '../../../consts.ts';
import {getDockText} from '../../../dock/getDockText.ts';
import {sendObsRequest} from '../../../obs/sendObsRequest.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import type {BridgeDataDto} from '../../../types/obs.ts';
import {checkStep} from '../checkStep.ts';

export const checkWaitingTargets = async () => {
    const enabledTitles = FAKE_MULTI_RTMP_ENABLED_TARGETS.map(({name}) => name);

    const switchedOffTitles = FAKE_MULTI_RTMP_CONFIG.targets
        .filter(({enabled}) => !enabled)
        .map(({name}) => name);

    const dockText = await waitFor('an empty card of each enabled obs-multi-rtmp target before the first stream', async () => {
        const text = await getDockText();

        return enabledTitles.every(title => text.includes(title)) ? text : null;
    }, CONNECTION_WAIT_MS);

    console.log('ok   each enabled obs-multi-rtmp target has an empty card with its name before the first stream');

    const waitingCardCount = dockText.split(DOCK_WAITING_FOR_STREAM_TEXT).length - 1;

    checkStep('the main card and each target card wait for their stream', waitingCardCount, enabledTitles.length + 1);
    checkStep('the dock shows no card of a switched off target', switchedOffTitles.some(title => dockText.includes(title)), false);
    checkStep('the dock shows the cards instead of the wait for the first stream', dockText.includes(DOCK_WAITING_FOR_FIRST_STREAM_TEXT), false);

    const {parameterValue} = await sendObsRequest('GetProfileParameter', BRIDGE_PARAMETER);
    const bridgeText = String(parameterValue);
    const {configuredTargets = []} = JSON.parse(bridgeText) as BridgeDataDto;
    const configuredIds = configuredTargets.map(({id}) => id).filter(id => OUTPUT_FINGERPRINT_PATTERN.test(id));

    checkStep('the bridge passes a fingerprint of each enabled target', new Set(configuredIds).size, enabledTitles.length);
    checkStep('the bridge passes no stream key of a target', bridgeText.includes(FAKE_MULTI_RTMP_KEY_PREFIX), false);
};
