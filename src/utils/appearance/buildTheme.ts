import {theme, ThemeConfig} from 'antd';
import type {Nullable} from 'infrastructure/common';

import {ObsThemeDto} from '__types/theme';
import {
    ACTIVE_WEIGHT,
    CONTROL_MIN_CONTRAST,
    DARK_SHADOW_OPACITY,
    ELEVATED_WEIGHT,
    FIELD_HOVER_WEIGHT,
    HOVER_WEIGHT,
    LIGHT_SHADOW_OPACITY,
    OBS_DEFAULT_FONT_SCALE,
    TEXT_MIN_CONTRAST,
} from '__utils/consts';
import {
    BASE_THEME,
    BITRATE_FONT_SIZE,
    DARK_THEME_COLORS,
    DOCK_FONT_SIZE,
    ERROR_COLOR,
    SUCCESS_COLOR,
    WARNING_COLOR,
} from '__utils/theme';

import {ensureContrast} from './colors/ensureContrast';
import {getRelativeLuminance} from './colors/getRelativeLuminance';
import {mixColors} from './colors/mixColors';

export const buildTheme = (obsTheme: Nullable<ObsThemeDto>): ThemeConfig => {
    const isDark = obsTheme?.isDark ?? true;

    const colorAlgorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;

    const {
        window: layout,
        base,
        text,
        textMuted,
        primary,
        border,
        input,
        inputBorder,
    } = obsTheme?.colors ?? DARK_THEME_COLORS;

    const accent = ensureContrast(primary, base, CONTROL_MIN_CONTRAST);
    const cardLink = ensureContrast(primary, base, TEXT_MIN_CONTRAST);
    const link = ensureContrast(cardLink, input, TEXT_MIN_CONTRAST);
    const linkHover = mixColors(link, text, HOVER_WEIGHT);
    const linkActive = mixColors(link, base, ACTIVE_WEIGHT);
    const error = ensureContrast(ERROR_COLOR, base, CONTROL_MIN_CONTRAST);
    const fieldHover = mixColors(input, text, FIELD_HOVER_WEIGHT);
    const shadowOpacity = isDark ? DARK_SHADOW_OPACITY : LIGHT_SHADOW_OPACITY;
    const fontRatio = (obsTheme?.fontScale ?? OBS_DEFAULT_FONT_SCALE) / OBS_DEFAULT_FONT_SCALE;
    const darkerBackground = getRelativeLuminance(layout) <= getRelativeLuminance(base) ? layout : base;
    const spotlight = colorAlgorithm({...theme.defaultSeed, colorBgBase: darkerBackground}).colorBgSpotlight;

    const fieldColors = {
        colorBgContainer: input,
        colorBorder: inputBorder,
        hoverBg: fieldHover,
        activeBg: fieldHover,
    };

    return {
        ...BASE_THEME,
        algorithm: [colorAlgorithm, theme.compactAlgorithm],
        token: {
            ...BASE_THEME.token,
            fontSize: Math.round(DOCK_FONT_SIZE * fontRatio),
            colorPrimary: accent,
            colorInfo: accent,
            colorLink: link,
            colorLinkHover: linkHover,
            colorLinkActive: linkActive,
            colorSuccess: ensureContrast(SUCCESS_COLOR, base, CONTROL_MIN_CONTRAST),
            colorWarning: ensureContrast(WARNING_COLOR, base, CONTROL_MIN_CONTRAST),
            colorError: error,
            colorErrorBorderHover: mixColors(error, text, HOVER_WEIGHT),
            colorBgBase: layout,
            colorBgLayout: layout,
            colorBgContainer: base,
            colorBgElevated: mixColors(base, input, ELEVATED_WEIGHT),
            colorBgSpotlight: spotlight,
            colorBorder: border,
            colorBorderSecondary: border,
            colorTextBase: text,
            colorTextDescription: ensureContrast(textMuted, base, TEXT_MIN_CONTRAST),
        },
        components: {
            ...BASE_THEME.components,
            Statistic: {
                contentFontSize: Math.round(BITRATE_FONT_SIZE * fontRatio),
            },
            Button: {
                colorLink: link,
                defaultColor: link,
                defaultBorderColor: link,
                defaultHoverColor: linkHover,
                defaultHoverBorderColor: linkHover,
                defaultActiveColor: linkActive,
                defaultActiveBorderColor: linkActive,
            },
            Typography: {
                colorLink: link,
            },
            Input: fieldColors,
            InputNumber: fieldColors,
            Mentions: fieldColors,
            DatePicker: fieldColors,
            Select: {
                ...fieldColors,
                selectorBg: input,
            },
            Cascader: fieldColors,
            TreeSelect: fieldColors,
            Message: {
                contentBg: input,
                boxShadowTertiary: `0 0 0 1px ${inputBorder}, 0 6px 16px 0 rgba(0, 0, 0, ${shadowOpacity})`,
            },
        },
    };
};
