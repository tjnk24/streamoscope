import {BridgeDataDto, BridgeOutputStatsDto} from '__types/bridge';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsOutputStatusDto, ObsStatsDto} from '__types/obs/responses';
import {LagViewDto} from '__types/stats/views';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';

export const LAG: LagViewDto = {
    skipped: 0,
    total: 0,
    recentSkipped: 0,
    recentTotal: 3600,
};

export const MAIN_TARGET: StreamTargetDto = {
    key: 'main',
    origin: OutputOriginEnum.Main,
    outputName: null,
    outputId: null,
    keyId: null,
    pluginName: null,
    targetTitle: null,
    platform: {
        title: 'YouTube',
        color: '#ff0000',
        isKnown: true,
        choices: [],
        guess: null,
    },
    notes: [],
};

export const STATS: ObsStatsDto = {
    activeFps: 60,
    averageFrameRenderTime: 1.2,
    cpuUsage: 4,
    memoryUsage: 480,
    availableDiskSpace: 85000,
    renderSkippedFrames: 0,
    renderTotalFrames: 0,
    outputSkippedFrames: 0,
    outputTotalFrames: 0,
};

export const STATS_REQUEST = {requestType: 'GetStats'};

const SUCCESS_STATUS = {
    result: true,
    code: 100,
};

export const STATS_RESULT = {
    requestType: 'GetStats',
    requestStatus: SUCCESS_STATUS,
    responseData: STATS,
};

const STREAM_STATUS: ObsOutputStatusDto = {
    outputActive: true,
    outputReconnecting: false,
    outputTimecode: '00:00:10.000',
    outputDuration: 10000,
    outputCongestion: 0,
    outputBytes: 0,
    outputSkippedFrames: 0,
    outputTotalFrames: 0,
};

const STREAM_STATUS_REQUEST = {requestType: 'GetStreamStatus'};

export const LIVE_PAIR: RequestResultPairDto = {
    request: STREAM_STATUS_REQUEST,
    result: {
        requestType: 'GetStreamStatus',
        requestStatus: SUCCESS_STATUS,
        responseData: STREAM_STATUS,
    },
};

export const OFFLINE_PAIR: RequestResultPairDto = {
    request: STREAM_STATUS_REQUEST,
    result: {
        requestType: 'GetStreamStatus',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            ...STREAM_STATUS,
            outputActive: false,
        },
    },
};

export const RECONNECTING_PAIR: RequestResultPairDto = {
    request: STREAM_STATUS_REQUEST,
    result: {
        requestType: 'GetStreamStatus',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            ...STREAM_STATUS,
            outputReconnecting: true,
        },
    },
};

export const FAILED_STATUS_PAIR: RequestResultPairDto = {
    request: STREAM_STATUS_REQUEST,
    result: {
        requestType: 'GetStreamStatus',
        requestStatus: {
            result: false,
            code: 207,
        },
    },
};

export const VIDEO_SETTINGS_PAIR: RequestResultPairDto = {
    request: {
        requestType: 'GetVideoSettings',
    },
    result: {
        requestType: 'GetVideoSettings',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            fpsNumerator: 60000,
            fpsDenominator: 1001,
        },
    },
};

export const MEASURED_TARGET: StreamTargetDto = {
    ...MAIN_TARGET,
    key: 'plugin:b7c20e11',
    origin: OutputOriginEnum.Plugin,
    outputName: 'multi-output',
    outputId: 'b7c20e11',
};

const BRIDGE_UPDATED_AT = 1800000000;

export const BRIDGE_NOW_MS = (BRIDGE_UPDATED_AT + 1) * 1000;

const BRIDGE_OUTPUT_STATS: BridgeOutputStatsDto = {
    isActive: true,
    totalBytes: 0,
    totalFrames: 600,
    droppedFrames: 0,
    durationMs: 10000,
    congestion: 0.25,
    isReconnecting: false,
};

const FIRST_BRIDGE_DATA: BridgeDataDto = {
    bridgeVersion: 7,
    updated: BRIDGE_UPDATED_AT,
    sampledAtMs: 5000,
    outputs: [
        {
            name: 'multi-output',
            server: 'rtmp://live.twitch.tv',
            id: 'b7c20e11',
            stats: BRIDGE_OUTPUT_STATS,
        },
    ],
};

const SECOND_BRIDGE_DATA: BridgeDataDto = {
    ...FIRST_BRIDGE_DATA,
    sampledAtMs: 6000,
    outputs: [
        {
            name: 'multi-output',
            server: 'rtmp://live.twitch.tv',
            id: 'b7c20e11',
            stats: {
                ...BRIDGE_OUTPUT_STATS,
                totalBytes: 500000,
                totalFrames: 660,
                durationMs: 11000,
            },
        },
    ],
};

const BRIDGE_REQUEST = {requestType: 'GetProfileParameter'};

export const FIRST_BRIDGE_PAIR: RequestResultPairDto = {
    request: BRIDGE_REQUEST,
    result: {
        requestType: 'GetProfileParameter',
        requestStatus: SUCCESS_STATUS,
        responseData: {parameterValue: JSON.stringify(FIRST_BRIDGE_DATA)},
    },
};

export const SECOND_BRIDGE_PAIR: RequestResultPairDto = {
    request: BRIDGE_REQUEST,
    result: {
        requestType: 'GetProfileParameter',
        requestStatus: SUCCESS_STATUS,
        responseData: {parameterValue: JSON.stringify(SECOND_BRIDGE_DATA)},
    },
};
