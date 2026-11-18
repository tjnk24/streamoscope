import type {StatsViewDto} from '__types/stats/views';
import type {StreamTargetDto} from '__types/targets';

export const getTotalBitrate = (targets: Pick<StreamTargetDto, 'key'>[], outputs: StatsViewDto['outputs']) => targets.reduce(
    (total, {key}) => {
        const output = outputs[key];

        if (!output?.isActive) {
            return total;
        }

        return {
            kbps: total.kbps + (output.kbps ?? 0),
            liveCount: total.liveCount + 1,
        };
    },
    {kbps: 0, liveCount: 0},
);
