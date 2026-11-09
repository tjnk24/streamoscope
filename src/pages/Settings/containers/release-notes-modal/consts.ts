import {MarkdownToJSX} from 'markdown-to-jsx/react';

import {LanguageEnum} from '__types/i18n/language';

import NotesLink from '../notes-link';

export const NOTES_SEPARATOR_PATTERN = /^---[ \t]*$/m;

export const RUSSIAN_NOTES_LANGUAGES: string[] = [LanguageEnum.Ru, LanguageEnum.Frog];

export const MARKDOWN_OPTIONS: MarkdownToJSX.Options = {
    disableParsingRawHTML: true,
    forceBlock: true,
    overrides: {
        a: NotesLink,
    },
};
