import {BaseStore} from '__reducers';
import {HardwareDto} from '__types/bridge';
import {GeneralViewDto, OutputViewDto} from '__types/stats/views';
import {BYTES_IN_GIGABYTE, OFF_OUTPUT_VIEW} from '__utils/consts';

const LIVE_VIEW: OutputViewDto = {
    ...OFF_OUTPUT_VIEW,
    isActive: true,
    kbps: 4000,
};

export const GENERAL_VIEW: GeneralViewDto = {
    fps: 59.94,
    targetFps: 60,
    frameTime: 1.234,
    memoryInMb: 480,
    encoding: {
        skipped: 10,
        total: 760,
        recentSkipped: 3,
        recentTotal: 60,
    },
    rendering: {
        skipped: 1,
        total: 760,
        recentSkipped: 0,
        recentTotal: 60,
    },
    advices: [],
};

export const HARDWARE: HardwareDto = {
    cpu: {
        usage: 5.43,
    },
    gpu: {
        name: 'NVIDIA GeForce RTX 4070 SUPER',
        usage: 43.71,
        encoder: 19.4,
        memoryInBytes: 5.3 * BYTES_IN_GIGABYTE,
        isSharedMemory: false,
    },
    systemMemory: {
        used: 14.2 * BYTES_IN_GIGABYTE,
        total: 31.9 * BYTES_IN_GIGABYTE,
    },
};

export const STATE = {
    stats: {
        targets: [{key: 'main'}, {key: 'plugin:5be0c1d2'}],
        view: {
            outputs: {
                'main': LIVE_VIEW,
                'plugin:5be0c1d2': {
                    ...LIVE_VIEW,
                    kbps: 2500.6,
                },
            },
            general: GENERAL_VIEW,
            now: 2000,
        },
        hardware: HARDWARE,
    },
    settings: {
        hiddenGeneralStats: [],
    },
} as unknown as BaseStore;

export const MARKUP_TAG_PATTERN = /<[^>]+>/g;
