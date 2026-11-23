import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {formatPercent} from '../formatPercent';

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
}));

describe('formatPercent', () => {
    it.each([
        {part: 0, total: 0, text: '0.0%'},
        {part: 5, total: 0, text: '0.0%'},
        {part: 0, total: 3600, text: '0.0%'},
        {part: 1, total: 100_000, text: '<0.1%'},
        {part: 1, total: 1000, text: '0.1%'},
        {part: 20, total: 540, text: '3.7%'},
        {part: 3600, total: 3600, text: '100.0%'},
    ])('$part of $total is $text', ({part, total, text}) => {
        expect(formatPercent(part, total)).toBe(text);
    });
});
