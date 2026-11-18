import {SelectProps} from 'antd';
import {ParseKeys} from 'i18next';

import {LanguageEnum} from '__types/i18n/language';
import {ThemeModeEnum} from '__types/theme';

const {
    En,
    Ru,
    Es,
    De,
    PtBr,
    Frog,
} = LanguageEnum;

export const LANGUAGE_OPTIONS: NonNullable<SelectProps<LanguageEnum>['options']> = [
    {value: En, label: 'English'},
    {value: Ru, label: 'Русский'},
    {value: Es, label: 'Español'},
    {value: De, label: 'Deutsch'},
    {value: PtBr, label: 'Português (Brasil)'},
    {value: Frog, label: 'Жабий'},
];

const {Obs, Dark, Light} = ThemeModeEnum;

export const THEME_MODE_TEXTS: Record<ThemeModeEnum, ParseKeys> = {
    [Obs]: 'settings.themeModes.obs',
    [Dark]: 'settings.themeModes.dark',
    [Light]: 'settings.themeModes.light',
};
