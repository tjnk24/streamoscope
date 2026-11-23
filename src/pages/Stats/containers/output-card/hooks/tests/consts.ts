import {BaseStore} from '__reducers';
import {HealthLevelEnum, OutputViewDto} from '__types/stats/views';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {OFF_OUTPUT_VIEW} from '__utils/consts';

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

export const PLUGIN_TARGET: StreamTargetDto = {
    ...MAIN_TARGET,
    key: 'plugin:5be0c1d2',
    origin: OutputOriginEnum.Plugin,
    outputName: 'multi-output',
    outputId: '5be0c1d2',
    pluginName: 'multi-rtmp',
    targetTitle: 'Main channel',
};

export const LIVE_VIEW: OutputViewDto = {
    ...OFF_OUTPUT_VIEW,
    isActive: true,
    level: HealthLevelEnum.Warn,
    kbps: 4000.4,
    timecode: '00:00:11.000',
    dropped: 3,
    total: 660,
    recentDropped: 3,
    recentTotal: 600,
    congestion: 0.2,
};

export const STATE = {
    stats: {
        targets: [MAIN_TARGET, PLUGIN_TARGET],
        view: {
            outputs: {
                [MAIN_TARGET.key]: LIVE_VIEW,
            },
            general: null,
            now: 2000,
        },
    },
    settings: {
        hiddenOutputStats: [],
        cardPlatforms: {},
    },
} as unknown as BaseStore;

export const MARKUP_TAG_PATTERN = /<[^>]+>/g;
