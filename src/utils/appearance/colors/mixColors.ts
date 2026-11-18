import {RGB_CHANNEL_MAX} from '__utils/consts';

import {toRgbChannels} from './toRgbChannels';

export const mixColors = (first: string, second: string, weight: number) => {
    const secondChannels = toRgbChannels(second);

    const mixedChannels = toRgbChannels(first).map((channel, channelIndex) => {
        const mixed = Math.round((channel * (1 - weight)) + (secondChannels[channelIndex] * weight));

        return Math.min(RGB_CHANNEL_MAX, Math.max(0, mixed)).toString(16).padStart(2, '0');
    });

    return `#${mixedChannels.join('')}`;
};
