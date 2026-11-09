import {
    describe,
    expect,
    it,
} from 'vitest';

import {AdviceEnum} from '__types/stats/views';

import {getGeneralAdvices} from '../getGeneralAdvices';

import {LAG} from './consts';

const {Rendering, Encoding} = AdviceEnum;

describe('getGeneralAdvices', () => {
    it.each([
        ['no lag', LAG, LAG, []],
        ['six encoder frames in a minute, as on a real stream', {...LAG, recentSkipped: 6}, LAG, []],
        ['encoder lag of 0.5%', {...LAG, recentSkipped: 18}, LAG, [Encoding]],
        ['rendering lag of 0.5%', LAG, {...LAG, recentSkipped: 18}, [Rendering]],
        ['both', {...LAG, recentSkipped: 60}, {...LAG, recentSkipped: 18}, [Rendering, Encoding]],
        ['nothing to compare with', {...LAG, recentSkipped: 5, recentTotal: 0}, LAG, []],
    ])('gives the right advices for %s', (_name, encoding, rendering, advices) => {
        expect(getGeneralAdvices(encoding, rendering)).toEqual(advices);
    });
});
