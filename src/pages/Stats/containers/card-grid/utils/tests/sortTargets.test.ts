import {
    describe,
    expect,
    it,
} from 'vitest';

import {sortTargets} from '../sortTargets';

import {TARGETS} from './consts';

describe('sortTargets', () => {
    it.each([
        {
            name: 'keeps the default order while nothing was moved',
            cardOrder: [],
            expected: ['main', 'plugin:multi-output', 'plugin:other-output'],
        },
        {
            name: 'puts the cards in the saved order',
            cardOrder: ['plugin:other-output', 'main', 'plugin:multi-output'],
            expected: ['plugin:other-output', 'main', 'plugin:multi-output'],
        },
        {
            name: 'puts cards missing from the saved order last, in the default order',
            cardOrder: ['plugin:other-output'],
            expected: ['plugin:other-output', 'main', 'plugin:multi-output'],
        },
        {
            name: 'skips saved keys of outputs that are gone',
            cardOrder: ['plugin:gone', 'plugin:multi-output', 'main', 'plugin:other-output'],
            expected: ['plugin:multi-output', 'main', 'plugin:other-output'],
        },
    ])('$name', ({cardOrder, expected}) => {
        const sortedKeys = sortTargets(TARGETS, cardOrder).map(({key}) => key);

        expect(sortedKeys).toEqual(expected);
    });
});
