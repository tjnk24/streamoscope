import {
    describe,
    expect,
    it,
} from 'vitest';

import {DARK_THEME_COLORS, LIGHT_THEME_COLORS} from '__utils/theme';

import {parseObsTheme} from '../parseObsTheme';

import {ACRI_BRIDGE_THEME, ACRI_THEME} from './consts';

describe('parseObsTheme', () => {
    it('takes every color of the bridge theme', () => {
        expect(parseObsTheme(ACRI_BRIDGE_THEME)).toEqual(ACRI_THEME);
    });

    it('reads a theme it saved itself', () => {
        expect(parseObsTheme(ACRI_THEME)).toEqual(ACRI_THEME);
    });

    it('derives the optional colors from the background and the text', () => {
        const colors = {window: '#101010', base: '#181819', text: '#ffffff', primary: 'red'};

        const parsed = parseObsTheme({isDark: true, colors});

        expect(parsed?.colors.primary).toBe(DARK_THEME_COLORS.primary);
        expect(parsed?.colors.textMuted).toBe('#a3a3a3');
        expect(parsed?.colors.input).toBe(parsed?.colors.border);
    });

    it('decides the darkness by the background, not by the mark in the theme file', () => {
        const colors = {window: '#d3d3d3', base: '#e5e5e5', text: '#0a0a0a'};

        expect(parseObsTheme({isDark: true, colors})?.isDark).toBe(false);
    });

    it('drops the colors of a theme whose text is hard to read on its cards', () => {
        const colors = {window: '#202020', base: '#303030', text: '#505050', primary: '#ff0000'};

        expect(parseObsTheme({isDark: true, colors, fontScale: 12})).toEqual({isDark: true, colors: DARK_THEME_COLORS, fontScale: 12});
    });

    it('guesses the darkness from the background when the bridge cannot tell it', () => {
        const colors = {window: '#d3d3d3', base: '#e5e5e5', text: '#0a0a0a'};

        expect(parseObsTheme({colors})?.isDark).toBe(false);
    });

    it('falls back to its own palette when there are only light and dark, as in OBS 28 and 29', () => {
        expect(parseObsTheme({id: 'com.obsproject.Yami.Original', isDark: false})).toEqual({isDark: false, colors: LIGHT_THEME_COLORS, fontScale: null});
        expect(parseObsTheme({isDark: true, colors: {window: '#101010'}})).toEqual({isDark: true, colors: DARK_THEME_COLORS, fontScale: null});
    });

    it.each([
        [12, 12],
        [8, 8],
        [100, 20],
        ['12', null],
        [Number.NaN, null],
    ])('takes the OBS font size %s as %s', (fontScale, expected) => {
        expect(parseObsTheme({...ACRI_BRIDGE_THEME, fontScale})?.fontScale).toBe(expected);
    });

    it.each([
        ['nothing', undefined],
        ['a string', 'dark'],
        ['a theme without colors and darkness', {id: 'com.obsproject.System'}],
    ])('gives nothing for %s', (_case, theme) => {
        expect(parseObsTheme(theme)).toBeNull();
    });
});
