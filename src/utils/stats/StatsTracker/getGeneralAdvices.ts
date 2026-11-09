import {AdviceEnum, LagViewDto} from '__types/stats/views';
import {ADVICE_LAG_SHARE} from '__utils/consts';

const {Rendering, Encoding} = AdviceEnum;

export const getGeneralAdvices = (encoding: LagViewDto, rendering: LagViewDto) => {
    const renderingShare = rendering.recentTotal > 0 ? rendering.recentSkipped / rendering.recentTotal : 0;
    const encodingShare = encoding.recentTotal > 0 ? encoding.recentSkipped / encoding.recentTotal : 0;

    return [
        ...(renderingShare >= ADVICE_LAG_SHARE ? [Rendering] : []),
        ...(encodingShare >= ADVICE_LAG_SHARE ? [Encoding] : []),
    ];
};
