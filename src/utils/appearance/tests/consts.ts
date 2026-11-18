import {BridgeThemeDto} from '__types/bridge';
import {ObsThemeDto} from '__types/theme';

export const ACRI_BRIDGE_THEME: BridgeThemeDto = {
    id: 'com.obsproject.Yami.Acri',
    isDark: true,
    colors: {
        window: '#101010',
        base: '#181819',
        text: '#FFFFFF',
        textMuted: '#969696',
        primary: '#131a30',
        border: '#28282a',
        input: '#28282a',
        inputBorder: '#616161',
    },
};

export const ACRI_THEME: ObsThemeDto = {
    isDark: true,
    colors: {
        window: '#101010',
        base: '#181819',
        text: '#ffffff',
        textMuted: '#969696',
        primary: '#131a30',
        border: '#28282a',
        input: '#28282a',
        inputBorder: '#616161',
    },
};

export const LIGHT_THEME: ObsThemeDto = {
    isDark: false,
    colors: {
        window: '#d3d3d3',
        base: '#e5e5e5',
        text: '#0a0a0a',
        textMuted: '#646464',
        primary: '#8cb5ff',
        border: '#f5f5f5',
        input: '#f5f5f5',
        inputBorder: '#8c8c8c',
    },
};
