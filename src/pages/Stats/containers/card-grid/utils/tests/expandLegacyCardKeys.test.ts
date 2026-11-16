import {
    describe,
    expect,
    it,
} from 'vitest';

import {expandLegacyCardKeys} from '../expandLegacyCardKeys';

import {MEASURED_TARGETS} from './consts';

describe('expandLegacyCardKeys', () => {
    it.each([
        {
            name: 'puts cards of an output where its old card was',
            cardOrder: ['plugin:multi-output', 'main'],
            expected: ['plugin:multi-output', 'plugin:a3f91c07', 'plugin:b7c20e11', 'main'],
        },
        {
            name: 'leaves cards already in the saved order where they are',
            cardOrder: ['plugin:multi-output', 'main', 'plugin:b7c20e11'],
            expected: ['plugin:multi-output', 'plugin:a3f91c07', 'main', 'plugin:b7c20e11'],
        },
        {
            name: 'changes nothing without the old key',
            cardOrder: ['main'],
            expected: ['main'],
        },
    ])('$name', ({cardOrder, expected}) => {
        expect(expandLegacyCardKeys(cardOrder, MEASURED_TARGETS)).toEqual(expected);
    });
});
