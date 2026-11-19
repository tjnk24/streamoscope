import sortBy from 'lodash/sortBy.js';
import uniq from 'lodash/uniq.js';

import {
    BRIDGE_PARAMETER,
    CARD_BITRATES_EXPRESSION,
    DOCK_SAME_KEY_WARNING_TEXT,
    DOCK_SAME_NAME_WARNING_TEXT,
    MULTI_RTMP_CONFIG,
    MULTI_RTMP_ENABLED_TARGETS,
    MULTI_RTMP_KEY_PREFIX,
    MULTI_RTMP_SRT_SERVER_ORIGIN,
    JOURNAL_OUTPUT_ID_STATS_PATTERN,
    JOURNAL_FORBIDDEN_TEXTS,
    JOURNAL_MULTI_RTMP_UNREADABLE_TEXT,
    JOURNAL_PATH,
    OUTPUT_FINGERPRINT_PATTERN,
    PLUGIN_BITRATE_TOLERANCE,
    STAND_MAIN_BITRATE,
    STREAM_WAIT_MS,
} from '../../../consts.ts';
import {evaluateInDock} from '../../../dock/evaluateInDock.ts';
import {getDockText} from '../../../dock/getDockText.ts';
import {sendObsRequest} from '../../../obs/sendObsRequest.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import type {BridgeDataDto} from '../../../types/obs.ts';
import {readStandFile} from '../../readStandFile.ts';
import {checkStep} from '../checkStep.ts';

import {countReadyPluginPaths} from './countReadyPluginPaths.ts';

export const checkPluginOutputs = async () => {
    const bitrates = new Map(MULTI_RTMP_CONFIG.video_configs.map(({id, param}) => [id, param.bitrate]));
    const targetBitrates = MULTI_RTMP_ENABLED_TARGETS.map(target => bitrates.get(target['video-config']) ?? 0);
    const expectedBitrates = sortBy([STAND_MAIN_BITRATE, ...targetBitrates]);

    await sendObsRequest('StartStream');

    await waitFor('an output named multi-output for each target on the RTMP server', async () => await countReadyPluginPaths() === targetBitrates.length, STREAM_WAIT_MS);
    console.log(`ok   the RTMP server receives ${targetBitrates.length} outputs named multi-output together with the main stream`);

    const shownBitrates = await waitFor('a card with its own bitrate for the main stream and each output', async () => {
        const bitrates = sortBy(await evaluateInDock<number[]>(CARD_BITRATES_EXPRESSION));
        const isEachOwn = bitrates.length === expectedBitrates.length && bitrates.every((kbps, index) => (
            Math.abs(kbps - expectedBitrates[index]) <= expectedBitrates[index] * PLUGIN_BITRATE_TOLERANCE
        ));

        return isEachOwn ? bitrates : null;
    }, STREAM_WAIT_MS);

    console.log(`ok   the main stream and each output have their own card with their own bitrate: ${shownBitrates.join(', ')} kbps`);

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

    checkStep('the bridge passes a fingerprint of each output', uniq(pluginIds).filter(id => OUTPUT_FINGERPRINT_PATTERN.test(id)).length, targetBitrates.length);
    checkStep('each output has the fingerprint of its target known before the start', sortBy(pluginIds).join(','), sortBy(configuredIds).join(','));
    checkStep('the main output has the key fingerprint of the main stream', mainKeyOutputNames.length - pluginMainKeyCount, 1);
    checkStep('only the copy of the main stream among the plugin outputs has it', pluginMainKeyCount, 1);

    const dockText = await getDockText();

    checkStep('the cards of the started targets keep their names', MULTI_RTMP_ENABLED_TARGETS.every(({name}) => dockText.includes(name)), true);
    checkStep('the bridge passes no stream key', bridgeText.includes(MULTI_RTMP_KEY_PREFIX), false);

    const srtOutputCount = bridgeOutputs.filter(({name, stats, server}) => name === 'multi-output' && stats && server === MULTI_RTMP_SRT_SERVER_ORIGIN).length;

    checkStep('the SRT output has stats and the address cut to its scheme and host', srtOutputCount, 1);

    await waitFor('the statistics of each output in the journal', () => {
        const journalIds = [...(readStandFile(JOURNAL_PATH) ?? '').matchAll(JOURNAL_OUTPUT_ID_STATS_PATTERN)].map(([, id]) => id);

        return uniq(journalIds).length === targetBitrates.length;
    }, STREAM_WAIT_MS);

    console.log('ok   the journal has the statistics of each output under its fingerprint');

    const journal = readStandFile(JOURNAL_PATH) ?? '';

    checkStep('the journal has no stream key', journal.includes(MULTI_RTMP_KEY_PREFIX), false);
    checkStep('the bridge understands obs-multi-rtmp.json', journal.includes(JOURNAL_MULTI_RTMP_UNREADABLE_TEXT), false);
    checkStep('the journal has no address or path', JOURNAL_FORBIDDEN_TEXTS.filter(text => journal.includes(text)).join(', '), '');

    await sendObsRequest('StopStream');

    await waitFor('the outputs named multi-output to stop with the main stream', async () => await countReadyPluginPaths() === 0, STREAM_WAIT_MS);
    console.log('ok   the outputs named multi-output stop with the main stream');
};
