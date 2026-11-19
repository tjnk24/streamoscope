import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import {languageService} from '__services/languageService';
import {storageService} from '__services/storageService';
import {LanguageEnum} from '__types/i18n/language';

import {ja} from './locales/asian/ja';
import {ko} from './locales/asian/ko';
import {th} from './locales/asian/th';
import {zhCn} from './locales/asian/zhCn';
import {zhTw} from './locales/asian/zhTw';
import {frog} from './locales/cyrillic/frog';
import {ru} from './locales/cyrillic/ru';
import {uk} from './locales/cyrillic/uk';
import {en} from './locales/en';
import {id} from './locales/latin/asia/id';
import {tr} from './locales/latin/asia/tr';
import {vi} from './locales/latin/asia/vi';
import {de} from './locales/latin/europe/de';
import {es} from './locales/latin/europe/es';
import {fr} from './locales/latin/europe/fr';
import {it} from './locales/latin/europe/it';
import {nl} from './locales/latin/europe/nl';
import {pl} from './locales/latin/europe/pl';
import {ptBr} from './locales/latin/europe/ptBr';

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

void i18n.use(initReactI18next).init({
    resources: {
        [En]: {translation: en},
        [Ru]: {translation: ru},
        [Uk]: {translation: uk},
        [Es]: {translation: es},
        [De]: {translation: de},
        [Fr]: {translation: fr},
        [It]: {translation: it},
        [Nl]: {translation: nl},
        [Pl]: {translation: pl},
        [PtBr]: {translation: ptBr},
        [Tr]: {translation: tr},
        [Vi]: {translation: vi},
        [Id]: {translation: id},
        [Th]: {translation: th},
        [Ja]: {translation: ja},
        [Ko]: {translation: ko},
        [ZhCn]: {translation: zhCn},
        [ZhTw]: {translation: zhTw},
        [Frog]: {translation: frog},
    },
    lng: languageService.resolveLanguage(storageService.loadSettings().language),
    fallbackLng: En,
    interpolation: {escapeValue: false},
    initAsync: false,
});

document.documentElement.lang = i18n.language;

i18n.on('languageChanged', language => {
    document.documentElement.lang = language;
});

import.meta.webpackHot?.decline();
