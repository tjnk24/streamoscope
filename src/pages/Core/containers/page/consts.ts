import {ConfigProviderProps} from 'antd';
import {Locale} from 'antd/es/locale';
import deDE from 'antd/locale/de_DE';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import frFR from 'antd/locale/fr_FR';
import idID from 'antd/locale/id_ID';
import itIT from 'antd/locale/it_IT';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import nlNL from 'antd/locale/nl_NL';
import plPL from 'antd/locale/pl_PL';
import ptBR from 'antd/locale/pt_BR';
import ruRU from 'antd/locale/ru_RU';
import thTH from 'antd/locale/th_TH';
import trTR from 'antd/locale/tr_TR';
import ukUA from 'antd/locale/uk_UA';
import viVN from 'antd/locale/vi_VN';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';

import {LanguageEnum} from '__types/i18n/language';

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

export const ANTD_LOCALES: Record<LanguageEnum, Locale> = {
    [En]: enUS,
    [Ru]: ruRU,
    [Uk]: ukUA,
    [Es]: esES,
    [De]: deDE,
    [Fr]: frFR,
    [It]: itIT,
    [Nl]: nlNL,
    [Pl]: plPL,
    [PtBr]: ptBR,
    [Tr]: trTR,
    [Vi]: viVN,
    [Id]: idID,
    [Th]: thTH,
    [Ja]: jaJP,
    [Ko]: koKR,
    [ZhCn]: zhCN,
    [ZhTw]: zhTW,
    [Frog]: ruRU,
};

export const BUTTON_CONFIG: ConfigProviderProps['button'] = {autoInsertSpace: false};
