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
    It,
    Nl,
    Pl,
    PtBr,
    Tr,
    Vi,
    Id,
    Th,
    Ja,
    Ko,
    ZhCn,
    ZhTw,
    Frog,
} = LanguageEnum;

export const LANGUAGE_OPTIONS: NonNullable<SelectProps<LanguageEnum>['options']> = [
    {value: En, label: 'English'},
    {value: Ru, label: 'Русский'},
    {value: Uk, label: 'Українська'},
    {value: Es, label: 'Español'},
    {value: De, label: 'Deutsch'},
    {value: Fr, label: 'Français'},
    {value: It, label: 'Italiano'},
    {value: Nl, label: 'Nederlands'},
    {value: Pl, label: 'Polski'},
    {value: PtBr, label: 'Português (Brasil)'},
    {value: Tr, label: 'Türkçe'},
    {value: Vi, label: 'Tiếng Việt'},
    {value: Id, label: 'Bahasa Indonesia'},
    {value: Th, label: 'ไทย'},
    {value: Ja, label: '日本語'},
    {value: Ko, label: '한국어'},
    {value: ZhCn, label: '简体中文'},
    {value: ZhTw, label: '繁體中文'},
    {value: Frog, label: 'Жабий'},
];

const {Obs, Dark, Light} = ThemeModeEnum;

export const THEME_MODE_TEXTS: Record<ThemeModeEnum, ParseKeys> = {
    [Obs]: 'settings.themeModes.obs',
    [Dark]: 'settings.themeModes.dark',
    [Light]: 'settings.themeModes.light',
};
