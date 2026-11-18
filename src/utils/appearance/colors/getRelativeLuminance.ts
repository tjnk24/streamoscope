import {
    LUMINANCE_CHANNEL_WEIGHTS,
    LUMINANCE_GAMMA,
    LUMINANCE_GAMMA_OFFSET,
    LUMINANCE_LINEAR_DIVISOR,
    LUMINANCE_LINEAR_LIMIT,
    RGB_CHANNEL_MAX,
} from '__utils/consts';

import {toRgbChannels} from './toRgbChannels';

export const getRelativeLuminance = (color: string) => toRgbChannels(color).reduce((luminance, channel, channelIndex) => {
    const share = channel / RGB_CHANNEL_MAX;

    const linear = share <= LUMINANCE_LINEAR_LIMIT
        ? share / LUMINANCE_LINEAR_DIVISOR
        : ((share + LUMINANCE_GAMMA_OFFSET) / (1 + LUMINANCE_GAMMA_OFFSET)) ** LUMINANCE_GAMMA;

    return luminance + (linear * LUMINANCE_CHANNEL_WEIGHTS[channelIndex]);
}, 0);
