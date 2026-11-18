import {
    BLACK_COLOR,
    CONTRAST_STEPS,
    DARK_LUMINANCE_LIMIT,
    WHITE_COLOR,
} from '__utils/consts';

import {getContrastRatio} from './getContrastRatio';
import {getRelativeLuminance} from './getRelativeLuminance';
import {mixColors} from './mixColors';

export const ensureContrast = (color: string, background: string, minContrast: number) => {
    const target = getRelativeLuminance(background) < DARK_LUMINANCE_LIMIT ? WHITE_COLOR : BLACK_COLOR;

    for (let step = 0; step < CONTRAST_STEPS; step++) {
        const candidate = mixColors(color, target, step / CONTRAST_STEPS);

        if (getContrastRatio(candidate, background) >= minContrast) {
            return candidate;
        }
    }

    return target;
};
