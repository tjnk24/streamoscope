import {MarkdownToJSX} from 'markdown-to-jsx/react';

import {LanguageEnum} from '__types/i18n/language';

import NotesLink from '../notes-link';

const {Ru, Frog} = LanguageEnum;

export const NOTES_SEPARATOR_PATTERN = /^---[ \t]*$/m;

export const RUSSIAN_NOTES_LANGUAGES: string[] = [Ru, Frog];

export const MARKDOWN_OPTIONS: MarkdownToJSX.Options = {
    disableParsingRawHTML: true,
    forceBlock: true,
    overrides: {
        a: NotesLink,
    },
};
