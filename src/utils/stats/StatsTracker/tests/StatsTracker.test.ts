import {
    describe,
    expect,
    it,
} from 'vitest';

import {AdviceEnum} from '__types/stats/views';

import {StatsTracker} from '../StatsTracker';

import {
    FAILED_STATUS_PAIR,
    LIVE_PAIR,
    MAIN_TARGET,
    OFFLINE_PAIR,
    RECONNECTING_PAIR,
    STATS,
    STATS_REQUEST,
    STATS_RESULT,
    VIDEO_SETTINGS_PAIR,
} from './consts';

describe('StatsTracker', () => {
    it('counts lag from the panel connection and again from the stream start', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 28,
                        renderTotalFrames: 1000,
                    },
                },
            },
            OFFLINE_PAIR,
        ], 0);

        const beforeStream = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 30,
                        renderTotalFrames: 1060,
                    },
                },
            },
            OFFLINE_PAIR,
        ], 1000);

        expect(beforeStream.general?.rendering).toMatchObject({skipped: 2, total: 60});

        const streamStart = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 31,
                        renderTotalFrames: 1120,
                    },
                },
            },
            LIVE_PAIR,
        ], 2000);

        expect(streamStart.general?.rendering).toMatchObject({skipped: 0, total: 0});

        const duringStream = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 35,
                        renderTotalFrames: 1180,
                    },
                },
            },
            LIVE_PAIR,
        ], 3000);

        expect(duringStream.general?.rendering).toMatchObject({skipped: 4, total: 60});
    });

    it('keeps counting when OBS fails to answer about the stream for a moment', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        outputSkippedFrames: 10,
                        outputTotalFrames: 1000,
                    },
                },
            },
            LIVE_PAIR,
        ], 0);

        tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        outputSkippedFrames: 12,
                        outputTotalFrames: 1060,
                    },
                },
            },
            FAILED_STATUS_PAIR,
        ], 1000);

        const afterFailure = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        outputSkippedFrames: 13,
                        outputTotalFrames: 1120,
                    },
                },
            },
            LIVE_PAIR,
        ], 2000);

        expect(afterFailure.general?.encoding).toMatchObject({skipped: 3, total: 120});
    });

    it('keeps the lag start when the graphs are reset', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 10,
                        renderTotalFrames: 1000,
                    },
                },
            },
            LIVE_PAIR,
        ], 0);

        tracker.resetGraphs();

        const afterReset = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 12,
                        renderTotalFrames: 1060,
                    },
                },
            },
            LIVE_PAIR,
        ], 1000);

        expect(afterReset.general?.rendering).toEqual({skipped: 2, total: 60, recentSkipped: 0, recentTotal: 0});
    });

    it('starts counting lag again after a reconnect', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 10,
                        renderTotalFrames: 1000,
                    },
                },
            },
            LIVE_PAIR,
        ], 0);

        tracker.reset();

        const afterReconnect = tracker.ingest([MAIN_TARGET], [
            {
                request: STATS_REQUEST,
                result: {
                    ...STATS_RESULT,
                    responseData: {
                        ...STATS,
                        renderSkippedFrames: 12,
                        renderTotalFrames: 1060,
                    },
                },
            },
            LIVE_PAIR,
        ], 1000);

        expect(afterReconnect.general?.rendering).toMatchObject({skipped: 0, total: 0});
    });

    it('advises on a reconnect once it has lasted three seconds', () => {
        const tracker = new StatsTracker();

        const statsPair = {request: STATS_REQUEST, result: STATS_RESULT};

        tracker.ingest([MAIN_TARGET], [statsPair, LIVE_PAIR], 0);
        tracker.ingest([MAIN_TARGET], [statsPair, RECONNECTING_PAIR], 1000);

        const beforeDelay = tracker.ingest([MAIN_TARGET], [statsPair, RECONNECTING_PAIR], 2000);

        expect(beforeDelay.outputs[MAIN_TARGET.key].advices).toEqual([]);

        const afterDelay = tracker.ingest([MAIN_TARGET], [statsPair, RECONNECTING_PAIR], 4000);

        expect(afterDelay.outputs[MAIN_TARGET.key].advices).toEqual([AdviceEnum.Reconnecting]);
    });

    it('takes the frame rate set in OBS from the video settings and keeps it', () => {
        const tracker = new StatsTracker();

        const statsPair = {request: STATS_REQUEST, result: STATS_RESULT};

        expect(tracker.ingest([MAIN_TARGET], [statsPair, LIVE_PAIR], 0).general?.targetFps).toBeNull();
        expect(tracker.ingest([MAIN_TARGET], [statsPair, LIVE_PAIR, VIDEO_SETTINGS_PAIR], 1000).general?.targetFps).toBeCloseTo(59.94, 2);
        expect(tracker.ingest([MAIN_TARGET], [statsPair, LIVE_PAIR], 2000).general?.targetFps).toBeCloseTo(59.94, 2);
    });
});
