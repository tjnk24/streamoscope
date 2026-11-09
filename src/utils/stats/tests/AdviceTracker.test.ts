import {
    describe,
    expect,
    it,
} from 'vitest';

import {AdviceEnum} from '__types/stats/views';

import {AdviceTracker} from '../AdviceTracker';

const {DroppedFrames, Congestion} = AdviceEnum;

describe('AdviceTracker', () => {
    it('shows advice once the problem has lasted three seconds', () => {
        const tracker = new AdviceTracker();

        expect(tracker.update(0, [DroppedFrames])).toEqual([]);
        expect(tracker.update(2000, [DroppedFrames])).toEqual([]);
        expect(tracker.update(3000, [DroppedFrames])).toEqual([DroppedFrames]);
    });

    it('hides advice three seconds after the problem is over', () => {
        const tracker = new AdviceTracker();

        tracker.update(0, [DroppedFrames]);
        tracker.update(3000, [DroppedFrames]);

        expect(tracker.update(4000, [])).toEqual([DroppedFrames]);
        expect(tracker.update(6999, [])).toEqual([DroppedFrames]);
        expect(tracker.update(7000, [])).toEqual([]);
    });

    it('ignores a short blip', () => {
        const tracker = new AdviceTracker();

        tracker.update(0, [DroppedFrames]);
        tracker.update(1000, []);
        tracker.update(2000, [DroppedFrames]);

        expect(tracker.update(4000, [DroppedFrames])).toEqual([]);
        expect(tracker.update(5000, [DroppedFrames])).toEqual([DroppedFrames]);
    });

    it('keeps advice through a short dip', () => {
        const tracker = new AdviceTracker();

        tracker.update(0, [Congestion]);
        tracker.update(3000, [Congestion]);
        tracker.update(4000, []);

        expect(tracker.update(5000, [Congestion])).toEqual([Congestion]);
        expect(tracker.update(8000, [])).toEqual([Congestion]);
        expect(tracker.update(11_000, [])).toEqual([]);
    });

    it('tracks each advice on its own', () => {
        const tracker = new AdviceTracker();

        tracker.update(0, [DroppedFrames]);
        tracker.update(1000, [DroppedFrames, Congestion]);

        expect(tracker.update(3000, [DroppedFrames, Congestion])).toEqual([DroppedFrames]);
        expect(tracker.update(4000, [DroppedFrames, Congestion])).toEqual([DroppedFrames, Congestion]);
    });

    it('forgets advice on reset', () => {
        const tracker = new AdviceTracker();

        tracker.update(0, [DroppedFrames]);
        tracker.update(3000, [DroppedFrames]);
        tracker.reset();

        expect(tracker.update(4000, [])).toEqual([]);
    });
});
