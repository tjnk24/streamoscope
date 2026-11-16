import isNumber from 'lodash/isNumber';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsOutputStatusDto, ObsProfileParameterDto} from '__types/obs/responses';
import {OutputSampleDto} from '__types/stats/tracking';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';
import {formatOutputTimecode} from '__utils/stats/formatOutputTimecode';

import {getMeasuredOutputs} from './getMeasuredOutputs';
import {parseBridgeData} from './parseBridgeData';

export const getBridgeOutputSamples = (pairs: RequestResultPairDto[]) => {
    const samples = new Map<string, OutputSampleDto>();
    const parameter = findResultData<ObsProfileParameterDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetProfileParameter));
    const bridgeData = parseBridgeData(parameter);
    const sampledAtMs = bridgeData?.sampledAtMs;

    if (!isNumber(sampledAtMs)) {
        return samples;
    }

    getMeasuredOutputs(bridgeData).forEach(({id, stats}) => {
        const status: ObsOutputStatusDto = {
            outputActive: stats.isActive,
            outputReconnecting: stats.isReconnecting,
            outputTimecode: formatOutputTimecode(stats.durationMs / 1000),
            outputDuration: stats.durationMs,
            outputCongestion: stats.congestion,
            outputBytes: stats.totalBytes,
            outputSkippedFrames: stats.droppedFrames,
            outputTotalFrames: stats.totalFrames,
        };

        samples.set(id, {status, time: sampledAtMs});
    });

    return samples;
};
