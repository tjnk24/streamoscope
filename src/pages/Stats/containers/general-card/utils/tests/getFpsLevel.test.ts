import {
    describe,
    expect,
    it,
} from 'vitest';

import {HealthLevelEnum} from '__types/stats/views';

import {getFpsLevel} from '../getFpsLevel';

const {Warn, Bad} = HealthLevelEnum;

describe('getFpsLevel', () => {
    it.each([
        ['the set frame rate', 60, 60, undefined],
        ['a little below it', 57.5, 60, undefined],
        ['below 95%', 56.9, 60, Warn],
        ['exactly 80%', 48, 60, Warn],
        ['below 80%', 47.9, 60, Bad],
        ['59.94 of 59.94', 59.94, 60000 / 1001, undefined],
        ['an unknown frame rate', 30, null, undefined],
    ])('gives the right level for %s', (_name, fps, targetFps, level) => {
        expect(getFpsLevel(fps, targetFps)).toBe(level);
    });
});
