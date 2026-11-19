import {
    describe,
    expect,
    it,
} from 'vitest';

import {getNotesForLanguage} from '../getNotesForLanguage';

import {
    ENGLISH_NOTES,
    NOTES,
    RUSSIAN_NOTES,
} from './consts';

describe('getNotesForLanguage', () => {
    it.each([
        ['English', 'en', ENGLISH_NOTES],
        ['Russian', 'ru', RUSSIAN_NOTES],
        ['the frog language', 'ru-x-frog', RUSSIAN_NOTES],
        ['German, which has no notes of its own', 'de', ENGLISH_NOTES],
        ['Ukrainian', 'uk', ENGLISH_NOTES],
        ['Polish', 'pl', ENGLISH_NOTES],
        ['French', 'fr', ENGLISH_NOTES],
        ['Korean', 'ko', ENGLISH_NOTES],
        ['Japanese', 'ja', ENGLISH_NOTES],
        ['Simplified Chinese', 'zh-CN', ENGLISH_NOTES],
        ['Thai', 'th', ENGLISH_NOTES],
    ])('takes the right part for %s', (_name, language, notes) => {
        expect(getNotesForLanguage(NOTES, language)).toBe(notes);
    });

    it('keeps the whole text for Russian when there is no separator', () => {
        expect(getNotesForLanguage(ENGLISH_NOTES, 'ru')).toBe(ENGLISH_NOTES);
    });
});
