import {
    describe,
    expect,
    it,
} from 'vitest';

import {moveCardKey} from '../moveCardKey';

describe('moveCardKey', () => {
    it.each([
        {
            name: 'saves the whole order on the first move',
            cardOrder: [],
            shownKeys: ['main', 'plugin:a', 'plugin:b'],
            movedKey: 'plugin:b',
            targetKey: 'main',
            expected: ['plugin:b', 'main', 'plugin:a'],
        },
        {
            name: 'moves a card forward behind the target',
            cardOrder: ['main', 'plugin:a', 'plugin:b'],
            shownKeys: ['main', 'plugin:a', 'plugin:b'],
            movedKey: 'main',
            targetKey: 'plugin:b',
            expected: ['plugin:a', 'plugin:b', 'main'],
        },
        {
            name: 'keeps the place of a card that is not shown now',
            cardOrder: ['plugin:b', 'plugin:hidden', 'main', 'plugin:a'],
            shownKeys: ['plugin:b', 'main', 'plugin:a'],
            movedKey: 'plugin:a',
            targetKey: 'plugin:b',
            expected: ['plugin:a', 'plugin:b', 'plugin:hidden', 'main'],
        },
        {
            name: 'adds new cards to the saved order before moving',
            cardOrder: ['plugin:a', 'main'],
            shownKeys: ['plugin:a', 'main', 'plugin:new'],
            movedKey: 'plugin:new',
            targetKey: 'plugin:a',
            expected: ['plugin:new', 'plugin:a', 'main'],
        },
    ])('$name', ({
        cardOrder,
        shownKeys,
        movedKey,
        targetKey,
        expected,
    }) => {
        expect(moveCardKey(cardOrder, shownKeys, movedKey, targetKey)).toEqual(expected);
    });
});
