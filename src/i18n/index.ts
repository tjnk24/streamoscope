import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import {languageService} from '__services/languageService';
import {storageService} from '__services/storageService';
import {LanguageEnum} from '__types/i18n/language';

import {ja} from './locales/cjk/ja';
import {ko} from './locales/cjk/ko';
import {frog} from './locales/cyrillic/frog';
import {ru} from './locales/cyrillic/ru';
import {uk} from './locales/cyrillic/uk';
import {en} from './locales/en';
import {de} from './locales/latin/de';
import {es} from './locales/latin/es';
import {fr} from './locales/latin/fr';
import {pl} from './locales/latin/pl';
import {ptBr} from './locales/latin/ptBr';

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

void i18n.use(initReactI18next).init({
    resources: {
        [En]: {translation: en},
        [Ru]: {translation: ru},
        [Uk]: {translation: uk},
        [Es]: {translation: es},
        [De]: {translation: de},
        [Fr]: {translation: fr},
        [Pl]: {translation: pl},
        [PtBr]: {translation: ptBr},
        [Ja]: {translation: ja},
        [Ko]: {translation: ko},
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
