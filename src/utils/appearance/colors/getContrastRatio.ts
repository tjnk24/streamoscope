import {CONTRAST_LUMINANCE_OFFSET} from '__utils/consts';

import {getRelativeLuminance} from './getRelativeLuminance';

export const getContrastRatio = (first: string, second: string) => {
    const firstLuminance = getRelativeLuminance(first);
    const secondLuminance = getRelativeLuminance(second);

    const lighter = Math.max(firstLuminance, secondLuminance) + CONTRAST_LUMINANCE_OFFSET;
    const darker = Math.min(firstLuminance, secondLuminance) + CONTRAST_LUMINANCE_OFFSET;

    return lighter / darker;
};
