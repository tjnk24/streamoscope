import {
    describe,
    expect,
    it,
} from 'vitest';

import {AdviceEnum, HealthLevelEnum} from '__types/stats/views';

import {getOutputAdvices} from '../getOutputAdvices';

const {Ok, Warn, Bad} = HealthLevelEnum;

const {Reconnecting, DroppedFrames, Congestion} = AdviceEnum;

describe('getOutputAdvices', () => {
    it.each([
        ['a healthy output', false, Ok, 0.02, []],
        ['a few dropped frames', false, Warn, 0.1, []],
        ['1% of frames dropped in a minute', false, Bad, 0.1, [DroppedFrames]],
        ['a congested send buffer', false, Ok, 0.5, [Congestion]],
        ['a reconnect with drops and congestion', true, Bad, 0.9, [Reconnecting, DroppedFrames, Congestion]],
    ])('gives the right advices for %s', (_name, isReconnecting, level, congestion, advices) => {
        expect(getOutputAdvices(isReconnecting, level, congestion)).toEqual(advices);
    });
});
