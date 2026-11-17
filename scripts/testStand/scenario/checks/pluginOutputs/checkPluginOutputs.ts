import sortBy from 'lodash/sortBy.js';
import uniq from 'lodash/uniq.js';

import {
    BRIDGE_PARAMETER,
    CARD_BITRATES_EXPRESSION,
    DOCK_SAME_KEY_WARNING_TEXT,
    DOCK_SAME_NAME_WARNING_TEXT,
    FAKE_MULTI_RTMP_CONFIG,
    FAKE_MULTI_RTMP_ENABLED_TARGETS,
    FAKE_MULTI_RTMP_KEY_PREFIX,
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
    const bitrates = new Map(FAKE_MULTI_RTMP_CONFIG.video_configs.map(({id, param}) => [id, param.bitrate]));
    const targetBitrates = FAKE_MULTI_RTMP_ENABLED_TARGETS.map(target => bitrates.get(target['video-config']) ?? 0);
    const expectedBitrates = sortBy(targetBitrates);

    await setFakeMultiRtmp(true);

    await waitFor('an output named multi-output for each target on the RTMP server', async () => await countReadyPluginPaths() === expectedBitrates.length, STREAM_WAIT_MS);
    console.log(`ok   the RTMP server receives ${expectedBitrates.length} outputs named multi-output`);

    const shownBitrates = await waitFor('a card with its own bitrate for each output', async () => {
        const bitrates = sortBy(await evaluateInDock<number[]>(CARD_BITRATES_EXPRESSION));
        const isEachOwn = bitrates.length === expectedBitrates.length && bitrates.every((kbps, index) => (
            Math.abs(kbps - expectedBitrates[index]) <= expectedBitrates[index] * PLUGIN_BITRATE_TOLERANCE
        ));

        return isEachOwn ? bitrates : null;
    }, STREAM_WAIT_MS);

    console.log(`ok   each output has its own card with its own bitrate: ${shownBitrates.join(', ')} kbps`);

    const streamingDockText = await getDockText();

    checkStep('the dock shows no warning about outputs of the same name', streamingDockText.includes(DOCK_SAME_NAME_WARNING_TEXT), false);
    checkStep('the dock still warns once about a target with the key of the main stream', streamingDockText.split(DOCK_SAME_KEY_WARNING_TEXT).length - 1, 1);

    const {parameterValue} = await sendObsRequest('GetProfileParameter', BRIDGE_PARAMETER);
    const bridgeText = String(parameterValue);
    const {outputs: bridgeOutputs, configuredTargets = [], mainKeyId = ''} = JSON.parse(bridgeText) as BridgeDataDto;
    const pluginIds = bridgeOutputs.filter(({name, stats}) => name === 'multi-output' && stats).map(({id}) => id ?? '');
    const configuredIds = configuredTargets.map(({id}) => id);
    const mainKeyOutputNames = bridgeOutputs.filter(({keyId}) => keyId === mainKeyId).map(({name}) => name);
    const pluginMainKeyCount = mainKeyOutputNames.filter(name => name === 'multi-output').length;

    checkStep('the bridge passes a fingerprint of each output', uniq(pluginIds).filter(id => OUTPUT_FINGERPRINT_PATTERN.test(id)).length, expectedBitrates.length);
    checkStep('each output has the fingerprint of its target known before the start', sortBy(pluginIds).join(','), sortBy(configuredIds).join(','));
    checkStep('the main output has the key fingerprint of the main stream', mainKeyOutputNames.length - pluginMainKeyCount, 1);
    checkStep('only the copy of the main stream among the plugin outputs has it', pluginMainKeyCount, 1);

    const dockText = await getDockText();

    checkStep('the cards of the started targets keep their names', FAKE_MULTI_RTMP_ENABLED_TARGETS.every(({name}) => dockText.includes(name)), true);
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
