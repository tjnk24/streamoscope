import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {formatNumber} from '../formatNumber';

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
}));

describe('formatNumber', () => {
    it.each([
        {value: 0, text: '0'},
        {value: 999, text: '999'},
        {value: 18193, text: '18,193'},
        {value: 1234567, text: '1,234,567'},
    ])('$value is $text', ({value, text}) => {
        expect(formatNumber(value)).toBe(text);
    });
});
