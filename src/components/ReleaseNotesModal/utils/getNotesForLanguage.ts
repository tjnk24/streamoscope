import {NOTES_SEPARATOR_PATTERN, RUSSIAN_NOTES_LANGUAGES} from '../consts';

export const getNotesForLanguage = (notes: string, language: string) => {
    const parts = notes.split(NOTES_SEPARATOR_PATTERN);
    const isRussian = RUSSIAN_NOTES_LANGUAGES.includes(language) && parts.length > 1;

    return (isRussian ? parts[1] : parts[0]).trim();
};
