import type {Nullable} from 'infrastructure/common';

import {ObsThemeDto, ThemeModeEnum} from '__types/theme';
import {DARK_THEME_COLORS, LIGHT_THEME_COLORS} from '__utils/theme';

const {Dark, Light} = ThemeModeEnum;

export const applyThemeMode = (obsTheme: Nullable<ObsThemeDto>, themeMode: ThemeModeEnum): Nullable<ObsThemeDto> => {
    const fontScale = obsTheme?.fontScale ?? null;

    if (themeMode === Dark) {
        return {isDark: true, colors: DARK_THEME_COLORS, fontScale};
    }

    if (themeMode === Light) {
        return {isDark: false, colors: LIGHT_THEME_COLORS, fontScale};
    }

    return obsTheme;
};
