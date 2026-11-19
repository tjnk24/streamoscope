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
    Ja,
    Ko,
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
        ['zh-CN', En],
    ])('takes the OBS language %s when none is chosen', (obsLanguage, language) => {
        vi.stubGlobal('navigator', {language: obsLanguage});

        expect(languageService.resolveLanguage(null)).toBe(language);
    });

    it('keeps the chosen language over the OBS one', () => {
        vi.stubGlobal('navigator', {language: 'ja-JP'});

        expect(languageService.resolveLanguage(Ko)).toBe(Ko);
    });
});
