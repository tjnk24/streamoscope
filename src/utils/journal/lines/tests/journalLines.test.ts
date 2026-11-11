import {
    describe,
    expect,
    it,
} from 'vitest';

import {formatJournalLine} from '../formatJournalLine';
import {removePrivateText} from '../removePrivateText';
import {trimJournalLines} from '../trimJournalLines';

import {
    ENTRY,
    JOURNAL_DATE,
    STACK_WITH_PRIVATE_PATHS,
    STACK_WITH_SPACED_USER_NAME,
} from './consts';

describe('removePrivateText', () => {
    it('removes folders, the user name and server addresses', () => {
        const cleaned = removePrivateText(STACK_WITH_PRIVATE_PATHS);

        expect(cleaned).not.toContain('Ivan');
        expect(cleaned).not.toContain('example.com');
        expect(cleaned).not.toContain('secret');
        expect(cleaned).toContain('app.bundle.js:1:2');
        expect(cleaned).toContain('scene.json');
    });

    it('removes folders with spaces in their names', () => {
        const cleaned = removePrivateText(STACK_WITH_SPACED_USER_NAME, false);

        expect(cleaned).not.toContain('Ivan');
        expect(cleaned).not.toContain('Petrov');
        expect(cleaned).toBe('    at render (app.bundle.js:1:2)\nfailed to open scene.json\nsaved to record.mkv');
    });

    it('joins lines for the journal and keeps them for the error report', () => {
        expect(removePrivateText('first\nsecond')).toBe('first | second');
        expect(removePrivateText('first\nsecond', false)).toBe('first\nsecond');
    });
});

describe('formatJournalLine', () => {
    it('writes the local time and aligned columns', () => {
        expect(formatJournalLine(ENTRY, JOURNAL_DATE)).toBe('2026-11-05 07:08:09 WARN  Twitch   reconnecting');
    });
});

describe('trimJournalLines', () => {
    it('drops the oldest lines over the limit', () => {
        expect(trimJournalLines(['aaaa', 'bbbb', 'cccc'], 10)).toEqual(['bbbb', 'cccc']);
    });

    it('keeps everything under the limit', () => {
        expect(trimJournalLines(['aaaa'], 10)).toEqual(['aaaa']);
    });
});
