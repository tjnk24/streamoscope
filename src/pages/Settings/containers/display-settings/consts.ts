import {SelectProps} from 'antd';
import {ParseKeys} from 'i18next';

import {LanguageEnum} from '__types/i18n/language';
import {ThemeModeEnum} from '__types/theme';

const {
    En,
    Ru,
    Uk,
    Es,
    De,
    Fr,
    Pl,
    PtBr,
    Ja,
    Ko,
    Frog,
} = LanguageEnum;

export const LANGUAGE_OPTIONS: NonNullable<SelectProps<LanguageEnum>['options']> = [
    {value: En, label: 'English'},
    {value: Ru, label: 'Русский'},
    {value: Uk, label: 'Українська'},
    {value: Es, label: 'Español'},
    {value: De, label: 'Deutsch'},
    {value: Fr, label: 'Français'},
    {value: Pl, label: 'Polski'},
    {value: PtBr, label: 'Português (Brasil)'},
    {value: Ja, label: '日本語'},
    {value: Ko, label: '한국어'},
    {value: Frog, label: 'Жабий'},
];

const {Obs, Dark, Light} = ThemeModeEnum;

export const THEME_MODE_TEXTS: Record<ThemeModeEnum, ParseKeys> = {
    [Obs]: 'settings.themeModes.obs',
    [Dark]: 'settings.themeModes.dark',
    [Light]: 'settings.themeModes.light',
};
