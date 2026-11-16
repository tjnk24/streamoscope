import {MockOutputStateDto} from '__types/mock';
import {ObsOutputStatusDto} from '__types/obs/responses';
import {formatOutputTimecode} from '__utils/stats/formatOutputTimecode';

export const buildMockOutputStatus = (
    output: MockOutputStateDto,
    now: number,
    congestion: number,
    isReconnecting: boolean,
): ObsOutputStatusDto => {
    const seconds = (now - output.startedAt) / 1000;

    return {
        outputActive: true,
        outputReconnecting: isReconnecting,
        outputTimecode: formatOutputTimecode(seconds),
        outputDuration: Math.round(seconds * 1000),
        outputCongestion: congestion,
        outputBytes: output.bytes,
        outputSkippedFrames: output.skippedFrames,
        outputTotalFrames: output.totalFrames,
    };
};
