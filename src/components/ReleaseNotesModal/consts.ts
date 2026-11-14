import {MarkdownToJSX} from 'markdown-to-jsx/react';

import NotesLink from '__components/NotesLink';
import {LanguageEnum} from '__types/i18n/language';

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
