import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {LanguageEnum} from '__types/i18n/language';

import {languageService} from '../languageService';

const {
    En,
    Ru,
    Uk,
    Fr,
    Pl,
    PtBr,
    It,
    Nl,
    Tr,
    Vi,
    Id,
    Th,
    Ja,
    Ko,
    ZhCn,
    ZhTw,
} = LanguageEnum;

vi.mock('__actions', () => ({commonActions: {}}));

describe('languageService.resolveLanguage', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it.each([
        ['ru-RU', Ru],
        ['uk-UA', Uk],
        ['fr-FR', Fr],
        ['pl-PL', Pl],
        ['pt-BR', PtBr],
        ['ja-JP', Ja],
        ['ko-KR', Ko],
        ['it-IT', It],
        ['nl-NL', Nl],
        ['tr-TR', Tr],
        ['vi-VN', Vi],
        ['id-ID', Id],
        ['th-TH', Th],
        ['zh-CN', ZhCn],
        ['zh-SG', ZhCn],
        ['zh-TW', ZhTw],
        ['zh-HK', ZhTw],
        ['zh-Hant', ZhTw],
        ['ar-SA', En],
    ])('takes the OBS language %s when none is chosen', (obsLanguage, language) => {
        vi.stubGlobal('navigator', {language: obsLanguage});

        expect(languageService.resolveLanguage(null)).toBe(language);
    });

    it('keeps the chosen language over the OBS one', () => {
        vi.stubGlobal('navigator', {language: 'ja-JP'});

        expect(languageService.resolveLanguage(Ko)).toBe(Ko);
    });
});
