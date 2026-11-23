import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {formatFixed} from '../formatFixed';

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
}));

describe('formatFixed', () => {
    it.each([
        {value: 60, digits: 2, text: '60.00'},
        {value: 59.94, digits: 2, text: '59.94'},
        {value: 1.25, digits: 1, text: '1.3'},
        {value: 38.71, digits: 1, text: '38.7'},
        {value: 12345.6, digits: 1, text: '12,345.6'},
    ])('$value with $digits digits is $text', ({value, digits, text}) => {
        expect(formatFixed(value, digits)).toBe(text);
    });
});
