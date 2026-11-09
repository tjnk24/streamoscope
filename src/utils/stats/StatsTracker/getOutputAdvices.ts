import {AdviceEnum, HealthLevelEnum} from '__types/stats/views';
import {ADVICE_CONGESTION} from '__utils/consts';

const {Reconnecting, DroppedFrames, Congestion} = AdviceEnum;

export const getOutputAdvices = (isReconnecting: boolean, level: HealthLevelEnum, congestion: number) => [
    ...(isReconnecting ? [Reconnecting] : []),
    ...(level === HealthLevelEnum.Bad ? [DroppedFrames] : []),
    ...(congestion >= ADVICE_CONGESTION ? [Congestion] : []),
];
