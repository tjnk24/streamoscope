import {
    describe,
    expect,
    it,
} from 'vitest';

import {ThemeModeEnum} from '__types/theme';
import {DARK_THEME_COLORS, LIGHT_THEME_COLORS} from '__utils/theme';

import {applyThemeMode} from '../applyThemeMode';

import {ACRI_THEME} from './consts';

const {Obs, Dark, Light} = ThemeModeEnum;

describe('applyThemeMode', () => {
    it('keeps the OBS theme as it is', () => {
        expect(applyThemeMode(ACRI_THEME, Obs)).toBe(ACRI_THEME);
        expect(applyThemeMode(null, Obs)).toBeNull();
    });

    it.each([
        [Dark, true, DARK_THEME_COLORS],
        [Light, false, LIGHT_THEME_COLORS],
    ])('puts its own %s colors over the OBS theme and keeps the OBS font size', (themeMode, isDark, colors) => {
        expect(applyThemeMode({...ACRI_THEME, fontScale: 12}, themeMode)).toEqual({isDark, colors, fontScale: 12});
        expect(applyThemeMode(null, themeMode)).toEqual({isDark, colors, fontScale: null});
    });
});
