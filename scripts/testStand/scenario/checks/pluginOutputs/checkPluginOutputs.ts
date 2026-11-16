import sortBy from 'lodash/sortBy.js';
import uniq from 'lodash/uniq.js';

import {
    BRIDGE_PARAMETER,
    CARD_BITRATES_EXPRESSION,
    DOCK_SAME_NAME_WARNING_TEXT,
    FAKE_MULTI_RTMP_KEY_PREFIX,
    FAKE_MULTI_RTMP_SETTINGS,
    JOURNAL_OUTPUT_ID_STATS_PATTERN,
    JOURNAL_PATH,
    OUTPUT_FINGERPRINT_PATTERN,
    PLUGIN_BITRATE_TOLERANCE,
    STREAM_WAIT_MS,
} from '../../../consts.ts';
import {evaluateInDock} from '../../../dock/evaluateInDock.ts';
import {getDockText} from '../../../dock/getDockText.ts';
import {sendObsRequest} from '../../../obs/sendObsRequest.ts';
import {setFakeMultiRtmp} from '../../../obs/setFakeMultiRtmp.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import type {BridgeDataDto} from '../../../types/obs.ts';
import {readStandFile} from '../../readStandFile.ts';
import {checkStep} from '../checkStep.ts';

import {countReadyPluginPaths} from './countReadyPluginPaths.ts';

export const checkPluginOutputs = async () => {
    const expectedBitrates = FAKE_MULTI_RTMP_SETTINGS.targets.map(({bitrate}) => bitrate);

    await setFakeMultiRtmp(true);

    await waitFor('three outputs named multi-output on the RTMP server', async () => await countReadyPluginPaths() === expectedBitrates.length, STREAM_WAIT_MS);
    console.log('ok   the RTMP server receives three outputs named multi-output');

    const shownBitrates = await waitFor('a card with its own bitrate for each output', async () => {
        const bitrates = sortBy(await evaluateInDock<number[]>(CARD_BITRATES_EXPRESSION));
        const isEachOwn = bitrates.length === expectedBitrates.length && bitrates.every((kbps, index) => (
            Math.abs(kbps - expectedBitrates[index]) <= expectedBitrates[index] * PLUGIN_BITRATE_TOLERANCE
        ));

        return isEachOwn ? bitrates : null;
    }, STREAM_WAIT_MS);

    console.log(`ok   each output has its own card with its own bitrate: ${shownBitrates.join(', ')} kbps`);

    checkStep('the dock shows no warning about outputs of the same name', (await getDockText()).includes(DOCK_SAME_NAME_WARNING_TEXT), false);

    const {parameterValue} = await sendObsRequest('GetProfileParameter', BRIDGE_PARAMETER);
    const bridgeText = String(parameterValue);
    const {outputs: bridgeOutputs} = JSON.parse(bridgeText) as BridgeDataDto;
    const pluginIds = bridgeOutputs.filter(({name, stats}) => name === 'multi-output' && stats).map(({id}) => id ?? '');

    checkStep('the bridge passes a fingerprint of each output', uniq(pluginIds).filter(id => OUTPUT_FINGERPRINT_PATTERN.test(id)).length, expectedBitrates.length);
    checkStep('the bridge passes no stream key', bridgeText.includes(FAKE_MULTI_RTMP_KEY_PREFIX), false);

    await waitFor('the statistics of each output in the journal', () => {
        const journalIds = [...(readStandFile(JOURNAL_PATH) ?? '').matchAll(JOURNAL_OUTPUT_ID_STATS_PATTERN)].map(([, id]) => id);

        return uniq(journalIds).length === expectedBitrates.length;
    }, STREAM_WAIT_MS);

    console.log('ok   the journal has the statistics of each output under its fingerprint');

    checkStep('the journal has no stream key', (readStandFile(JOURNAL_PATH) ?? '').includes(FAKE_MULTI_RTMP_KEY_PREFIX), false);

    await setFakeMultiRtmp(false);

    await waitFor('the outputs named multi-output to stop', async () => await countReadyPluginPaths() === 0, STREAM_WAIT_MS);
    console.log('ok   the outputs named multi-output stop');
};
