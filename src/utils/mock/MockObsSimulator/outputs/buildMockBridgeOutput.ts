import {BridgeOutputDto} from '__types/bridge';
import {MockOutputStateDto} from '__types/mock';

import {buildMockOutputStatus} from './buildMockOutputStatus';

export const buildMockBridgeOutput = (
    target: Pick<BridgeOutputDto, 'name' | 'server' | 'id'>,
    output: MockOutputStateDto,
    now: number,
    congestion: number,
    isReconnecting: boolean,
): BridgeOutputDto => {
    const status = buildMockOutputStatus(output, now, congestion, isReconnecting);

    return {
        ...target,
        stats: {
            isActive: status.outputActive,
            totalBytes: status.outputBytes,
            totalFrames: status.outputTotalFrames,
            droppedFrames: status.outputSkippedFrames,
            durationMs: status.outputDuration,
            congestion: status.outputCongestion,
            isReconnecting: status.outputReconnecting,
        },
    };
};
