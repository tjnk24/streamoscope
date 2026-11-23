import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {formatMemory} from '../formatMemory';

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
    t: (key: string, values: Record<string, string>) => `${key} ${values.value}`,
}));

describe('formatMemory', () => {
    it.each([
        {megabytes: 479.6, text: 'units.megabytes 480'},
        {megabytes: 1023, text: 'units.megabytes 1,023'},
        {megabytes: 1024, text: 'units.gigabytes 1.0'},
        {megabytes: 2560, text: 'units.gigabytes 2.5'},
    ])('$megabytes MB of OBS memory is $text', ({megabytes, text}) => {
        expect(formatMemory(megabytes)).toBe(text);
    });
});
