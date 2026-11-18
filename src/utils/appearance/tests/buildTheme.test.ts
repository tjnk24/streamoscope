import {theme} from 'antd';
import {
    describe,
    expect,
    it,
} from 'vitest';

import {DARK_THEME_COLORS} from '__utils/theme';

import {buildTheme} from '../buildTheme';
import {getContrastRatio} from '../colors/getContrastRatio';

import {ACRI_THEME, LIGHT_THEME} from './consts';

describe('buildTheme', () => {
    it('keeps the dark theme without a theme from OBS', () => {
        const {algorithm, token} = buildTheme(null);

        expect(algorithm).toEqual([theme.darkAlgorithm, theme.compactAlgorithm]);
        expect(token?.colorBgLayout).toBe(DARK_THEME_COLORS.window);
        expect(token?.colorBgContainer).toBe(DARK_THEME_COLORS.base);
        expect(token?.colorBorder).toBe(DARK_THEME_COLORS.border);
    });

    it('takes the backgrounds, the text, the borders and the fields from OBS', () => {
        const {token, components} = buildTheme(ACRI_THEME);

        expect(token?.colorBgLayout).toBe('#101010');
        expect(token?.colorBgContainer).toBe('#181819');
        expect(token?.colorTextBase).toBe('#ffffff');
        expect(token?.colorBorder).toBe('#28282a');
        expect(components?.Input?.colorBgContainer).toBe('#28282a');
        expect(components?.Input?.colorBorder).toBe('#616161');
    });

    it.each([
        ['Acri', ACRI_THEME],
        ['Light', LIGHT_THEME],
    ])('keeps the accent, the links and the statuses of %s readable on its cards and toasts', (_name, obsTheme) => {
        const {token} = buildTheme(obsTheme);

        const {base} = obsTheme.colors;

        expect(getContrastRatio(token?.colorPrimary ?? '', base)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(token?.colorLink ?? '', base)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(token?.colorLink ?? '', obsTheme.colors.input)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(token?.colorWarning ?? '', base)).toBeGreaterThanOrEqual(3);
        expect(getContrastRatio(token?.colorTextDescription ?? '', base)).toBeGreaterThanOrEqual(4.5);
    });

    it('builds the tooltip background from the darker of the window and the cards', () => {
        const classicTheme = {
            ...ACRI_THEME,
            colors: {
                ...ACRI_THEME.colors,
                window: '#3a393a',
                base: '#1f1e1f',
            },
        };

        const classicSpotlight = theme.darkAlgorithm({...theme.defaultSeed, colorBgBase: '#1f1e1f'}).colorBgSpotlight;
        const yamiSpotlight = theme.darkAlgorithm({...theme.defaultSeed, colorBgBase: DARK_THEME_COLORS.window}).colorBgSpotlight;

        expect(buildTheme(classicTheme).token?.colorBgSpotlight).toBe(classicSpotlight);
        expect(buildTheme(null).token?.colorBgSpotlight).toBe(yamiSpotlight);
    });

    it.each([
        [null, 14, 28],
        [10, 14, 28],
        [8, 11, 22],
        [12, 17, 34],
    ])('scales the font for the OBS font size %s', (fontScale, fontSize, bitrateFontSize) => {
        const {token, components} = buildTheme({...ACRI_THEME, fontScale});

        expect(token?.fontSize).toBe(fontSize);
        expect(components?.Statistic?.contentFontSize).toBe(bitrateFontSize);
    });

    it('switches to the light algorithm for a light theme', () => {
        expect(buildTheme(LIGHT_THEME).algorithm).toEqual([theme.defaultAlgorithm, theme.compactAlgorithm]);
    });
});
