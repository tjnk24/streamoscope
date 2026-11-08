import {RequestResultPairDto} from '__types/obs/requests';
import {ObsOutputStatusDto, ObsStatsDto} from '__types/obs/responses';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';

export const MAIN_TARGET: StreamTargetDto = {
    key: 'main',
    origin: OutputOriginEnum.Main,
    outputName: null,
    pluginName: null,
    platform: {title: 'YouTube', color: '#ff0000', isKnown: true},
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

export const STATS_RESULT = {
    requestType: 'GetStats',
    requestStatus: {result: true, code: 100},
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

export const LIVE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetStreamStatus'},
    result: {requestType: 'GetStreamStatus', requestStatus: {result: true, code: 100}, responseData: STREAM_STATUS},
};

export const OFFLINE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetStreamStatus'},
    result: {requestType: 'GetStreamStatus', requestStatus: {result: true, code: 100}, responseData: {...STREAM_STATUS, outputActive: false}},
};

export const FAILED_STATUS_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetStreamStatus'},
    result: {requestType: 'GetStreamStatus', requestStatus: {result: false, code: 207}},
};

export const VIDEO_SETTINGS_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetVideoSettings'},
    result: {requestType: 'GetVideoSettings', requestStatus: {result: true, code: 100}, responseData: {fpsNumerator: 60000, fpsDenominator: 1001}},
};
