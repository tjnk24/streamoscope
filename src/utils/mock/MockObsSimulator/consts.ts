import {BridgeConfiguredTargetDto} from '__types/bridge';
import {MockTargetDto} from '__types/mock';
import {ObsOutputStatusDto} from '__types/obs/responses';
import {BYTES_IN_GIGABYTE} from '__utils/consts';

export const MOCK_FPS = 60;
export const MOCK_MAIN_OUTPUT_NAME = 'adv_stream';
export const MOCK_TWITCH_OUTPUT_NAME = 'multi-output';
export const MOCK_TWITCH_OUTPUT_ID = '5be0c1d2';
export const MOCK_TWITCH_SERVER = 'rtmp://ingest.global-contribute.live-video.net';
const MOCK_GOODGAME_OUTPUT_ID = '9a41e7f3';
const MOCK_GOODGAME_SERVER = 'rtmp://msk.goodgame.ru:1940';
export const MOCK_MAIN_KEY_ID = 'c4d8e2f1';
export const MOCK_TWITCH_DELAY_SEC = 5;
export const MOCK_FIRST_STREAM_DELAY_SEC = 10;
export const MOCK_SCENE_COLLECTION = 'Mock scenes';
const MOCK_SHARED_SERVER_OUTPUT_ID = '6f2a9c41';
export const MOCK_SHARED_SERVER_CARD_KEY = `plugin:${MOCK_SHARED_SERVER_OUTPUT_ID}`;

export const MOCK_EXTRA_TARGETS: MockTargetDto[] = [
    {
        outputName: MOCK_TWITCH_OUTPUT_NAME,
        outputId: MOCK_GOODGAME_OUTPUT_ID,
        server: MOCK_GOODGAME_SERVER,
        minKbps: 3900,
        maxKbps: 4300,
    },
    {
        outputName: 'vk-live-output',
        outputId: '3d8c4f15',
        server: 'rtmp://rtmp.vkvideo.ru',
        minKbps: 4700,
        maxKbps: 5100,
    },
    {
        outputName: 'shared-server-output',
        outputId: MOCK_SHARED_SERVER_OUTPUT_ID,
        server: 'rtmp://vsu.mycdn.me/input',
        minKbps: 5800,
        maxKbps: 6200,
    },
];

export const MOCK_CONFIGURED_TARGETS: BridgeConfiguredTargetDto[] = [
    {
        id: MOCK_TWITCH_OUTPUT_ID,
        name: MOCK_TWITCH_OUTPUT_NAME,
        server: MOCK_TWITCH_SERVER,
        title: 'Main channel',
    },
    {
        id: MOCK_GOODGAME_OUTPUT_ID,
        name: MOCK_TWITCH_OUTPUT_NAME,
        server: MOCK_GOODGAME_SERVER,
        title: 'Night show',
    },
    {
        id: '71b3a5d8',
        keyId: MOCK_MAIN_KEY_ID,
        name: MOCK_TWITCH_OUTPUT_NAME,
        server: 'rtmp://a.rtmp.youtube.com/live2',
        title: 'Copy of main',
    },
];

export const MOCK_OFF_STREAM_STATUS: ObsOutputStatusDto = {
    outputActive: false,
    outputReconnecting: false,
    outputTimecode: '00:00:00.000',
    outputDuration: 0,
    outputCongestion: 0,
    outputBytes: 0,
    outputSkippedFrames: 0,
    outputTotalFrames: 0,
};

export const MOCK_GPU = {
    name: 'NVIDIA GeForce RTX 4070 SUPER',
    memoryInBytes: 5.3 * BYTES_IN_GIGABYTE,
    isSharedMemory: false,
};

export const MOCK_SYSTEM_MEMORY = {
    used: 14.2 * BYTES_IN_GIGABYTE,
    total: 31.9 * BYTES_IN_GIGABYTE,
};

export const OBS_OUTPUT_NOT_FOUND_CODE = 600;
export const OBS_UNKNOWN_REQUEST_CODE = 204;
