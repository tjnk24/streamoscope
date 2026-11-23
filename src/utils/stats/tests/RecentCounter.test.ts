import {
    describe,
    expect,
    it,
} from 'vitest';

import {RecentCounter} from '../RecentCounter';

describe('RecentCounter', () => {
    it('counts from the first sample', () => {
        const counter = new RecentCounter(60);

        expect(counter.add(0, 10, 1000)).toEqual({count: 0, total: 0});

        expect(counter.add(1000, 13, 1060)).toEqual({count: 3, total: 60});
    });

    it('keeps only the last window', () => {
        const counter = new RecentCounter(60);

        counter.add(0, 10, 1000);

        counter.add(30_000, 20, 2800);

        counter.add(61_000, 25, 4660);

        expect(counter.add(95_000, 26, 6700)).toEqual({count: 6, total: 3900});
    });

    it('starts again when the counters go down after an OBS restart', () => {
        const counter = new RecentCounter(60);

        counter.add(0, 10, 1000);

        counter.add(1000, 13, 1060);

        expect(counter.add(2000, 0, 60)).toEqual({count: 0, total: 0});

        expect(counter.add(3000, 2, 120)).toEqual({count: 2, total: 60});
    });

    it('forgets everything after a reset', () => {
        const counter = new RecentCounter(60);

        counter.add(0, 10, 1000);

        counter.reset();

        expect(counter.add(1000, 13, 1060)).toEqual({count: 0, total: 0});
    });
});
