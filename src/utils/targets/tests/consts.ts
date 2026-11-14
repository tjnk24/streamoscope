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
