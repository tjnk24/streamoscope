import {t} from 'i18next';
import countBy from 'lodash/countBy';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {
    ObsOutputListDto,
    ObsProfileParameterDto,
    ObsStreamServiceDto,
} from '__types/obs/responses';
import {
    NoteDto,
    OutputOriginEnum,
    StreamTargetDto,
} from '__types/targets';
import {parseBridgeData} from '__utils/bridge/parseBridgeData';
import {
    MAIN_OUTPUT_NAMES,
    MAIN_TARGET_KEY,
    PLUGIN_OUTPUT_NAMES,
} from '__utils/consts';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

import {detectPlatform} from '../detectPlatform';

const {GetStreamServiceSettings, GetOutputList, GetProfileParameter} = ObsRequestTypeEnum;
const {Main, Plugin} = OutputOriginEnum;

export const discoverTargets = (pairs: RequestResultPairDto[]): StreamTargetDto[] | null => {
    const service = findResultData<ObsStreamServiceDto>(pairs, isRequestOfType(GetStreamServiceSettings));
    const outputList = findResultData<ObsOutputListDto>(pairs, isRequestOfType(GetOutputList));

    if (!service || !outputList) {
        return null;
    }

    const outputs = outputList.outputs || [];
    const bridgeData = parseBridgeData(findResultData<ObsProfileParameterDto>(pairs, isRequestOfType(GetProfileParameter)));
    const bridge = bridgeData && new Map(bridgeData.outputs.map(({name, server}) => [name, server]));

    const {service: serviceName, server} = service.streamServiceSettings || {};

    const main: StreamTargetDto = {
        key: MAIN_TARGET_KEY,
        origin: Main,
        outputName: null,
        pluginName: null,
        platform: detectPlatform(serviceName ?? null, server ?? null, t('stats.mainFallbackTitle')),
        notes: [],
    };

    const pluginOutputNames = outputs
        .filter(({outputName, outputFlags}) => outputFlags?.OBS_OUTPUT_SERVICE && !MAIN_OUTPUT_NAMES.includes(outputName))
        .map(({outputName}) => outputName);

    const counts = countBy(pluginOutputNames);

    const plugins = Object.keys(counts).sort().map((outputName): StreamTargetDto => {
        const pluginName = PLUGIN_OUTPUT_NAMES[outputName] || null;
        const bridgeServer = bridge?.get(outputName);
        const notes: NoteDto[] = [];

        if (counts[outputName] > 1) {
            const sameNameNote: NoteDto = {
                text: t('stats.sameOutputName', {name: outputName, count: counts[outputName]}),
                type: 'warning',
            };

            notes.push(sameNameNote);
        }

        return {
            key: `plugin:${outputName}`,
            origin: Plugin,
            outputName,
            pluginName,
            platform: detectPlatform(null, bridgeServer ?? null, t('stats.unknownPlatform')),
            notes,
        };
    });

    return [main, ...plugins];
};
