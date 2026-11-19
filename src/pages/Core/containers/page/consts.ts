import {ConfigProviderProps} from 'antd';
import {Locale} from 'antd/es/locale';
import deDE from 'antd/locale/de_DE';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import frFR from 'antd/locale/fr_FR';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import plPL from 'antd/locale/pl_PL';
import ptBR from 'antd/locale/pt_BR';
import ruRU from 'antd/locale/ru_RU';
import ukUA from 'antd/locale/uk_UA';

import {LanguageEnum} from '__types/i18n/language';

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

export const ANTD_LOCALES: Record<LanguageEnum, Locale> = {
    [En]: enUS,
    [Ru]: ruRU,
    [Uk]: ukUA,
    [Es]: esES,
    [De]: deDE,
    [Fr]: frFR,
    [Pl]: plPL,
    [PtBr]: ptBR,
    [Ja]: jaJP,
    [Ko]: koKR,
    [Frog]: ruRU,
};

export const BUTTON_CONFIG: ConfigProviderProps['button'] = {autoInsertSpace: false};
