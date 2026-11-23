import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {AdviceEnum, HealthLevelEnum} from '__types/stats/views';
import {OFF_OUTPUT_VIEW} from '__utils/consts';

import {StatsTracker} from '../StatsTracker';

import {
    BRIDGE_NOW_MS,
    FAILED_STATUS_PAIR,
    FIRST_BRIDGE_PAIR,
    FIRST_LIVE_PAIR,
    FIRST_STATS_PAIR,
    LIVE_PAIR,
    MAIN_TARGET,
    MEASURED_TARGET,
    OFFLINE_PAIR,
    RECONNECTING_PAIR,
    RESTARTED_LIVE_PAIR,
    SECOND_BRIDGE_PAIR,
    SECOND_LIVE_PAIR,
    SECOND_STATS_PAIR,
    STATS,
    STATS_REQUEST,
    STATS_RESULT,
    VIDEO_SETTINGS_PAIR,
} from './consts';

describe('StatsTracker', () => {
    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(BRIDGE_NOW_MS);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

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

    it('counts an output of the bridge by the time of its sample and skips a repeated sample', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MEASURED_TARGET], [FIRST_BRIDGE_PAIR], 0);

        const nextSample = tracker.ingest([MEASURED_TARGET], [SECOND_BRIDGE_PAIR], 1700).outputs[MEASURED_TARGET.key];

        expect(nextSample).toMatchObject({kbps: 4000, timecode: '00:00:11.000', congestion: 0.25});

        const repeatedSample = tracker.ingest([MEASURED_TARGET], [SECOND_BRIDGE_PAIR], 2700).outputs[MEASURED_TARGET.key];

        expect(repeatedSample.graph).toHaveLength(1);
    });

    it('keeps the card of a bridge output while the bridge does not answer', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MEASURED_TARGET], [FIRST_BRIDGE_PAIR], 0);

        const nextSample = tracker.ingest([MEASURED_TARGET], [SECOND_BRIDGE_PAIR], 1000).outputs[MEASURED_TARGET.key];
        const withoutBridge = tracker.ingest([MEASURED_TARGET], [], 2000).outputs[MEASURED_TARGET.key];

        expect(withoutBridge).toBe(nextSample);
    });
    it('turns the bytes, frames and congestion of a live output into the card numbers', () => {
        const tracker = new StatsTracker();

        const firstView = tracker.ingest([MAIN_TARGET], [FIRST_LIVE_PAIR], 1000).outputs[MAIN_TARGET.key];

        expect(firstView).toMatchObject({isActive: true, kbps: null, dropped: 0, total: 600});

        const secondView = tracker.ingest([MAIN_TARGET], [SECOND_LIVE_PAIR], 2000).outputs[MAIN_TARGET.key];

        expect(secondView).toMatchObject({
            isActive: true,
            isReconnecting: false,
            level: HealthLevelEnum.Bad,
            kbps: 4000,
            timecode: '00:00:11.000',
            dropped: 3,
            total: 660,
            recentDropped: 3,
            recentTotal: 60,
            congestion: 0.2,
        });

        expect(secondView.graph).toEqual([{time: 2000, kbps: 4000}]);
    });

    it('shows a stopped output as off', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [FIRST_LIVE_PAIR], 1000);

        const stoppedView = tracker.ingest([MAIN_TARGET], [OFFLINE_PAIR], 2000).outputs[MAIN_TARGET.key];

        expect(stoppedView).toEqual(OFF_OUTPUT_VIEW);
    });

    it('starts the bitrate and the graph again when OBS restarts its counters', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [FIRST_LIVE_PAIR], 1000);

        tracker.ingest([MAIN_TARGET], [SECOND_LIVE_PAIR], 2000);

        const restartedView = tracker.ingest([MAIN_TARGET], [RESTARTED_LIVE_PAIR], 3000).outputs[MAIN_TARGET.key];

        expect(restartedView).toMatchObject({kbps: null, dropped: 0, total: 60, recentDropped: 0, recentTotal: 0});

        expect(restartedView.graph).toEqual([]);
    });

    it('passes the frame rate, frame time, memory and skipped frames of OBS to the OBS card', () => {
        const tracker = new StatsTracker();

        tracker.ingest([MAIN_TARGET], [FIRST_STATS_PAIR, VIDEO_SETTINGS_PAIR], 1000);

        const general = tracker.ingest([MAIN_TARGET], [SECOND_STATS_PAIR], 2000).general;

        expect(general).toMatchObject({
            fps: 59.94,
            frameTime: STATS.averageFrameRenderTime,
            memoryInMb: STATS.memoryUsage,
            encoding: {skipped: 3, total: 60, recentSkipped: 3, recentTotal: 60},
            rendering: {skipped: 1, total: 60, recentSkipped: 1, recentTotal: 60},
        });
    });
});
