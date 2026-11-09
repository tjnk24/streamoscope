import {
    describe,
    expect,
    it,
} from 'vitest';

import {LagCounter} from '../LagCounter';

describe('LagCounter', () => {
    it('counts from the first sample', () => {
        const counter = new LagCounter();

        expect(counter.add(0, 28, 1000)).toEqual({skipped: 0, total: 0, recentSkipped: 0, recentTotal: 0});
        expect(counter.add(1000, 30, 1060)).toEqual({skipped: 2, total: 60, recentSkipped: 2, recentTotal: 60});
    });

    it('starts again from the next sample after a restart', () => {
        const counter = new LagCounter();

        counter.add(0, 28, 1000);
        counter.add(1000, 30, 1060);
        counter.restart();

        expect(counter.add(2000, 31, 1120)).toMatchObject({skipped: 0, total: 0});
        expect(counter.add(3000, 35, 1180)).toMatchObject({skipped: 4, total: 60});
    });

    it('keeps the last minute across a restart', () => {
        const counter = new LagCounter();

        counter.add(0, 0, 0);
        counter.add(10_000, 4, 600);
        counter.restart();

        expect(counter.add(20_000, 6, 1200)).toEqual({skipped: 0, total: 0, recentSkipped: 6, recentTotal: 1200});
    });

    it('starts again when OBS counters go down', () => {
        const counter = new LagCounter();

        counter.add(0, 50, 5000);

        expect(counter.add(1000, 3, 100)).toEqual({skipped: 0, total: 0, recentSkipped: 0, recentTotal: 0});
    });

    it('forgets lag older than a minute', () => {
        const counter = new LagCounter();

        counter.add(0, 0, 0);

        expect(counter.add(30_000, 5, 1800).recentSkipped).toBe(5);
        expect(counter.add(90_001, 5, 5400)).toEqual({skipped: 5, total: 5400, recentSkipped: 0, recentTotal: 3600});
    });

    it('keeps the start when only the last minute is reset', () => {
        const counter = new LagCounter();

        counter.add(0, 10, 1000);
        counter.add(1000, 12, 1060);
        counter.resetRecent();

        expect(counter.add(2000, 13, 1120)).toEqual({skipped: 3, total: 120, recentSkipped: 0, recentTotal: 0});
    });
});
