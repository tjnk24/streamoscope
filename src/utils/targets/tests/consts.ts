import {
    BridgeDataDto,
    BridgeOutputDto,
    BridgeOutputStatsDto,
} from '__types/bridge';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsOutputListItemDto} from '__types/obs/responses';

const SUCCESS_STATUS = {
    result: true,
    code: 100,
};

const OUTPUT_LIST_REQUEST = {requestType: 'GetOutputList'};

const RECORDING_OUTPUT: ObsOutputListItemDto = {
    outputName: 'adv_file_output',
    outputKind: 'ffmpeg_muxer',
    outputActive: false,
    outputFlags: {
        OBS_OUTPUT_AUDIO: true,
        OBS_OUTPUT_VIDEO: true,
        OBS_OUTPUT_ENCODED: true,
        OBS_OUTPUT_MULTI_TRACK: true,
        OBS_OUTPUT_SERVICE: false,
    },
};

const VIRTUAL_CAMERA_OUTPUT: ObsOutputListItemDto = {
    outputName: 'virtualcam_output',
    outputKind: 'virtualcam_output',
    outputActive: false,
    outputFlags: {
        OBS_OUTPUT_AUDIO: false,
        OBS_OUTPUT_VIDEO: true,
        OBS_OUTPUT_ENCODED: false,
        OBS_OUTPUT_MULTI_TRACK: false,
        OBS_OUTPUT_SERVICE: false,
    },
};

const MAIN_STREAM_OUTPUT: ObsOutputListItemDto = {
    outputName: 'adv_stream',
    outputKind: 'rtmp_output',
    outputActive: false,
    outputFlags: {
        OBS_OUTPUT_AUDIO: true,
        OBS_OUTPUT_VIDEO: true,
        OBS_OUTPUT_ENCODED: true,
        OBS_OUTPUT_MULTI_TRACK: true,
        OBS_OUTPUT_SERVICE: true,
    },
};

const PLUGIN_STREAM_OUTPUT: ObsOutputListItemDto = {
    ...MAIN_STREAM_OUTPUT,
    outputName: 'multi-output',
    outputActive: true,
};

export const STATS_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetStats'},
    result: {
        requestType: 'GetStats',
        requestStatus: SUCCESS_STATUS,
        responseData: {},
    },
};

export const FAILED_OUTPUT_LIST_PAIR: RequestResultPairDto = {
    request: OUTPUT_LIST_REQUEST,
    result: {
        requestType: 'GetOutputList',
        requestStatus: {
            result: false,
            code: 204,
        },
    },
};

export const OFFLINE_OUTPUTS_PAIR: RequestResultPairDto = {
    request: OUTPUT_LIST_REQUEST,
    result: {
        requestType: 'GetOutputList',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            outputs: [RECORDING_OUTPUT, VIRTUAL_CAMERA_OUTPUT],
        },
    },
};

export const MAIN_STREAM_PAIR: RequestResultPairDto = {
    request: OUTPUT_LIST_REQUEST,
    result: {
        requestType: 'GetOutputList',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            outputs: [RECORDING_OUTPUT, MAIN_STREAM_OUTPUT],
        },
    },
};

export const PLUGIN_STREAM_PAIR: RequestResultPairDto = {
    request: OUTPUT_LIST_REQUEST,
    result: {
        requestType: 'GetOutputList',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            outputs: [VIRTUAL_CAMERA_OUTPUT, PLUGIN_STREAM_OUTPUT],
        },
    },
};

const BRIDGE_UPDATED_AT = 1800000000;

export const BRIDGE_NOW_MS = (BRIDGE_UPDATED_AT + 1) * 1000;

const OUTPUT_STATS: BridgeOutputStatsDto = {
    isActive: true,
    totalBytes: 1250000,
    totalFrames: 600,
    droppedFrames: 0,
    durationMs: 10000,
    congestion: 0,
    isReconnecting: false,
};

const TWITCH_OUTPUT: BridgeOutputDto = {
    name: 'multi-output',
    server: 'rtmp://live.twitch.tv',
    id: 'b7c20e11',
    stats: OUTPUT_STATS,
};

const SECOND_TWITCH_OUTPUT: BridgeOutputDto = {
    ...TWITCH_OUTPUT,
    id: '0f6d93aa',
};

const GOODGAME_OUTPUT: BridgeOutputDto = {
    ...TWITCH_OUTPUT,
    server: 'rtmp://msk.goodgame.ru:1940',
    id: 'a3f91c07',
};

const BRIDGE_DATA: BridgeDataDto = {
    bridgeVersion: 7,
    updated: BRIDGE_UPDATED_AT,
    sampledAtMs: 5000,
    outputs: [TWITCH_OUTPUT, GOODGAME_OUTPUT, SECOND_TWITCH_OUTPUT],
};

const OLD_BRIDGE_DATA: BridgeDataDto = {
    bridgeVersion: 6,
    updated: BRIDGE_UPDATED_AT,
    outputs: [{name: 'multi-output', server: 'rtmp://live.twitch.tv'}],
};

const SHORT_BRIDGE_DATA: BridgeDataDto = {
    ...BRIDGE_DATA,
    outputs: [TWITCH_OUTPUT, GOODGAME_OUTPUT],
};

export const SERVICE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetStreamServiceSettings'},
    result: {
        requestType: 'GetStreamServiceSettings',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            streamServiceType: 'rtmp_common',
            streamServiceSettings: {
                service: 'VK Video Live',
                server: 'rtmp://rtmp.vkvideo.ru',
            },
        },
    },
};

export const THREE_PLUGIN_OUTPUTS_PAIR: RequestResultPairDto = {
    request: OUTPUT_LIST_REQUEST,
    result: {
        requestType: 'GetOutputList',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            outputs: [MAIN_STREAM_OUTPUT, PLUGIN_STREAM_OUTPUT, PLUGIN_STREAM_OUTPUT, PLUGIN_STREAM_OUTPUT],
        },
    },
};

export const MEASURED_BRIDGE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetProfileParameter'},
    result: {
        requestType: 'GetProfileParameter',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            parameterValue: JSON.stringify(BRIDGE_DATA),
        },
    },
};

export const OLD_BRIDGE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetProfileParameter'},
    result: {
        requestType: 'GetProfileParameter',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            parameterValue: JSON.stringify(OLD_BRIDGE_DATA),
        },
    },
};

export const SHORT_BRIDGE_PAIR: RequestResultPairDto = {
    request: {requestType: 'GetProfileParameter'},
    result: {
        requestType: 'GetProfileParameter',
        requestStatus: SUCCESS_STATUS,
        responseData: {
            parameterValue: JSON.stringify(SHORT_BRIDGE_DATA),
        },
    },
};
