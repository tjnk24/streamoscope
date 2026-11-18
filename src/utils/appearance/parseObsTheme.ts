import type {Nullable} from 'infrastructure/common';
import clamp from 'lodash/clamp';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import pickBy from 'lodash/pickBy';

import {BridgeThemeDto} from '__types/bridge';
import {ObsThemeDto} from '__types/theme';
import {
    BORDER_WEIGHT,
    DARK_LUMINANCE_LIMIT,
    HEX_COLOR_PATTERN,
    INPUT_BORDER_WEIGHT,
    MUTED_TEXT_WEIGHT,
    OBS_MAX_FONT_SCALE,
    OBS_MIN_FONT_SCALE,
} from '__utils/consts';
import {DARK_THEME_COLORS, LIGHT_THEME_COLORS} from '__utils/theme';

import {getRelativeLuminance} from './colors/getRelativeLuminance';
import {mixColors} from './colors/mixColors';

export const parseObsTheme = (theme: unknown): Nullable<ObsThemeDto> => {
    if (!isPlainObject(theme)) {
        return null;
    }

    const {isDark, colors, fontScale} = theme as BridgeThemeDto;

    const knownFontScale = isNumber(fontScale) && Number.isFinite(fontScale) ? clamp(fontScale, OBS_MIN_FONT_SCALE, OBS_MAX_FONT_SCALE) : null;

    const validColors = isPlainObject(colors) ? pickBy(colors, color => isString(color) && HEX_COLOR_PATTERN.test(color)) : {};

    const knownColors = Object.fromEntries(Object.entries(validColors).map(([name, color]) => [name, color.toLowerCase()]));

    const {window: layout, base, text} = knownColors;

    if (!layout || !base || !text) {
        if (!isBoolean(isDark)) {
            return null;
        }

        return {
            isDark,
            colors: isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS,
            fontScale: knownFontScale,
        };
    }

    const isThemeDark = isBoolean(isDark) ? isDark : getRelativeLuminance(base) < DARK_LUMINANCE_LIMIT;

    const border = knownColors.border ?? mixColors(base, text, BORDER_WEIGHT);

    return {
        isDark: isThemeDark,
        colors: {
            window: layout,
            base,
            text,
            textMuted: knownColors.textMuted ?? mixColors(text, base, MUTED_TEXT_WEIGHT),
            primary: knownColors.primary ?? (isThemeDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS).primary,
            border,
            input: knownColors.input ?? border,
            inputBorder: knownColors.inputBorder ?? mixColors(base, text, INPUT_BORDER_WEIGHT),
        },
        fontScale: knownFontScale,
    };
};
