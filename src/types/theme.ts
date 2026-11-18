import type {Nullable} from 'infrastructure/common';

export type ObsThemeColorsDto = {
    window: string;
    base: string;
    text: string;
    textMuted: string;
    primary: string;
    border: string;
    input: string;
    inputBorder: string;
};

export type ObsThemeDto = {
    isDark: boolean;
    colors: ObsThemeColorsDto;
    fontScale: Nullable<number>;
};
