import {ThemeConfig} from 'antd';

import {ObsThemeColorsDto} from '__types/theme';

export const THEME_CSS_VAR_KEY = 'css-var-app';

export const SUCCESS_COLOR = '#4cb36c';

export const WARNING_COLOR = '#e2a63b';

export const ERROR_COLOR = '#e5534b';

export const DOCK_FONT_SIZE = 14;

export const BITRATE_FONT_SIZE = 28;

export const DARK_THEME_COLORS: ObsThemeColorsDto = {
    window: '#1d1f26',
    base: '#272a33',
    text: '#ffffff',
    textMuted: '#969696',
    primary: '#284cb8',
    border: '#3c404d',
    input: '#3c404d',
    inputBorder: '#5b6273',
};

export const LIGHT_THEME_COLORS: ObsThemeColorsDto = {
    window: '#d3d3d3',
    base: '#e5e5e5',
    text: '#0a0a0a',
    textMuted: '#646464',
    primary: '#8cb5ff',
    border: '#f5f5f5',
    input: '#f5f5f5',
    inputBorder: '#8c8c8c',
};

export const BASE_THEME: ThemeConfig = {
    cssVar: {
        key: THEME_CSS_VAR_KEY,
    },
    token: {
        borderRadius: 5,
        fontFamily: '\'Inter Variable\', Inter, Roboto, \'Helvetica Neue\', Geneva, arial, Tahoma, verdana, sans-serif',
    },
    components: {
        Descriptions: {
            itemPaddingBottom: 2,
            itemPaddingEnd: 24,
        },
    },
};
