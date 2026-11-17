import {theme, ThemeConfig} from 'antd';

export const THEME_CSS_VAR_KEY = 'css-var-app';

const DEFAULT_BUTTON_COLORS = {
    defaultColor: '#65a9f3',
    defaultBorderColor: '#65a9f3',
    defaultHoverColor: '#8dc5f8',
    defaultHoverBorderColor: '#8dc5f8',
    defaultActiveColor: '#4998e8',
    defaultActiveBorderColor: '#4998e8',
};

const FIELD_COLORS = {
    colorBgContainer: '#363a46',
    hoverBg: '#3b404d',
    activeBg: '#3b404d',
};

export const THEME: ThemeConfig = {
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    cssVar: {
        key: THEME_CSS_VAR_KEY,
    },
    token: {
        colorPrimary: '#2689fb',
        colorInfo: '#2689fb',
        colorSuccess: '#4cb36c',
        colorWarning: '#e2a63b',
        colorError: '#e5534b',
        colorLinkHover: '#4998e8',
        colorErrorBorderHover: '#dc766d',
        colorBgBase: '#1D1F26',
        colorBgLayout: '#1D1F26',
        colorBgContainer: '#272a33',
        colorBgElevated: '#30343e',
        colorBorder: '#3c404d',
        colorBorderSecondary: '#3c404d',
        borderRadius: 5,
        fontSize: 14,
        fontFamily: '\'Inter Variable\', Inter, Roboto, \'Helvetica Neue\', Geneva, arial, Tahoma, verdana, sans-serif',
    },
    components: {
        Descriptions: {
            itemPaddingBottom: 2,
            itemPaddingEnd: 24,
        },
        Statistic: {
            contentFontSize: 28,
        },
        Button: DEFAULT_BUTTON_COLORS,
        Input: FIELD_COLORS,
        InputNumber: FIELD_COLORS,
        Mentions: FIELD_COLORS,
        DatePicker: FIELD_COLORS,
        Select: {
            colorBgContainer: FIELD_COLORS.colorBgContainer,
            selectorBg: FIELD_COLORS.colorBgContainer,
        },
        Cascader: {
            colorBgContainer: FIELD_COLORS.colorBgContainer,
        },
        TreeSelect: {
            colorBgContainer: FIELD_COLORS.colorBgContainer,
        },
        Message: {
            contentBg: '#3b404d',
            boxShadowTertiary: '0 0 0 1px #555b6e, 0 6px 16px 0 rgba(0, 0, 0, 0.55)',
        },
    },
};
