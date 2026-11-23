import {
    describe,
    expect,
    it,
} from 'vitest';

import {HealthLevelEnum} from '__types/stats/views';

import {getHealthLevel} from '../getHealthLevel';

const {Ok, Warn, Bad} = HealthLevelEnum;

describe('getHealthLevel', () => {
    it.each([
        {recentDropped: 0, recentTotal: 3600, level: Ok},
        {recentDropped: 0, recentTotal: 0, level: Ok},
        {recentDropped: 1, recentTotal: 3600, level: Warn},
        {recentDropped: 35, recentTotal: 3600, level: Warn},
        {recentDropped: 36, recentTotal: 3600, level: Bad},
        {recentDropped: 600, recentTotal: 3600, level: Bad},
        {recentDropped: 5, recentTotal: 0, level: Warn},
    ])('$recentDropped dropped of $recentTotal in the last minute is $level', ({recentDropped, recentTotal, level}) => {
        expect(getHealthLevel(recentDropped, recentTotal)).toBe(level);
    });
});
