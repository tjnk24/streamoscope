import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {BYTES_IN_GIGABYTE} from '__utils/consts';

import {formatGigabytes} from '../formatGigabytes';

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
}));

describe('formatGigabytes', () => {
    it.each([
        {bytes: 0, text: '0.0'},
        {bytes: 5.3 * BYTES_IN_GIGABYTE, text: '5.3'},
        {bytes: 31.9 * BYTES_IN_GIGABYTE, text: '31.9'},
        {bytes: BYTES_IN_GIGABYTE / 2, text: '0.5'},
    ])('$bytes bytes are $text GB', ({bytes, text}) => {
        expect(formatGigabytes(bytes)).toBe(text);
    });
});
