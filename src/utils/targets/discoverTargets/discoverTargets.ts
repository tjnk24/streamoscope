import {t} from 'i18next';
import countBy from 'lodash/countBy';
import groupBy from 'lodash/groupBy';
import isString from 'lodash/isString';
import uniq from 'lodash/uniq';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {
    ObsOutputListDto,
    ObsProfileParameterDto,
    ObsStreamServiceDto,
} from '__types/obs/responses';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {getConfiguredTargets} from '__utils/bridge/getConfiguredTargets';
import {getMeasuredOutputs} from '__utils/bridge/getMeasuredOutputs';
import {parseBridgeData} from '__utils/bridge/parseBridgeData';
import {MAIN_OUTPUT_NAMES, MAIN_TARGET_KEY} from '__utils/consts';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

import {detectPlatform} from '../detectPlatform';

import {buildIdentifiedTargets} from './buildIdentifiedTargets';
import {buildNamedTarget} from './buildNamedTarget';

const {GetStreamServiceSettings, GetOutputList, GetProfileParameter} = ObsRequestTypeEnum;

export const discoverTargets = (pairs: RequestResultPairDto[]): StreamTargetDto[] | null => {
    const service = findResultData<ObsStreamServiceDto>(pairs, isRequestOfType(GetStreamServiceSettings));
    const outputList = findResultData<ObsOutputListDto>(pairs, isRequestOfType(GetOutputList));

    if (!service || !outputList) {
        return null;
    }

    const outputs = outputList.outputs || [];
    const bridgeData = parseBridgeData(findResultData<ObsProfileParameterDto>(pairs, isRequestOfType(GetProfileParameter)));
    const bridgeServers = bridgeData && new Map(bridgeData.outputs.map(({name, server}) => [name, server]));
    const measuredOutputs = groupBy(getMeasuredOutputs(bridgeData), 'name');
    const configuredTargets = getConfiguredTargets(bridgeData);
    const configuredOutputs = groupBy(configuredTargets, 'name');
    const titles = new Map(configuredTargets.map(({id, title}) => [id, isString(title) ? title.trim() : '']));

    const {service: serviceName, server} = service.streamServiceSettings || {};

    const main: StreamTargetDto = {
        key: MAIN_TARGET_KEY,
        origin: OutputOriginEnum.Main,
        outputName: null,
        outputId: null,
        pluginName: null,
        targetTitle: null,
        platform: detectPlatform(serviceName ?? null, server ?? null, t('stats.mainFallbackTitle')),
        notes: [],
    };

    const pluginOutputNames = outputs
        .filter(({outputName, outputFlags}) => outputFlags?.OBS_OUTPUT_SERVICE && !MAIN_OUTPUT_NAMES.includes(outputName))
        .map(({outputName}) => outputName);

    const counts = countBy(pluginOutputNames);

    const outputNames = uniq([...Object.keys(counts), ...Object.keys(configuredOutputs)]).sort();

    const plugins = outputNames.flatMap(outputName => {
        const measured = measuredOutputs[outputName] ?? [];
        const count = counts[outputName] ?? 0;

        if (measured.length !== count) {
            return [buildNamedTarget(outputName, count, bridgeServers?.get(outputName) ?? null)];
        }

        const measuredIds = new Set(measured.map(({id}) => id));
        const waiting = (configuredOutputs[outputName] ?? []).filter(({id}) => !measuredIds.has(id));

        return buildIdentifiedTargets([...measured, ...waiting], titles);
    });

    return [main, ...plugins];
};
