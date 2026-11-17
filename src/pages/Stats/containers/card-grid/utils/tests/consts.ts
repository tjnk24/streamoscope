import {OutputOriginEnum, StreamTargetDto} from '__types/targets';

const {Main, Plugin} = OutputOriginEnum;

const MAIN_TARGET: StreamTargetDto = {
    key: 'main',
    origin: Main,
    outputName: null,
    outputId: null,
    pluginName: null,
    targetTitle: null,
    platform: {
        title: 'YouTube',
        color: '#ff0000',
        isKnown: true,
    },
    notes: [],
};

const MULTI_RTMP_TARGET: StreamTargetDto = {
    key: 'plugin:multi-output',
    origin: Plugin,
    outputName: 'multi-output',
    outputId: null,
    pluginName: 'multi-rtmp',
    targetTitle: null,
    platform: {
        title: 'Twitch',
        color: '#9146ff',
        isKnown: true,
    },
    notes: [],
};

const OTHER_PLUGIN_TARGET: StreamTargetDto = {
    key: 'plugin:other-output',
    origin: Plugin,
    outputName: 'other-output',
    outputId: null,
    pluginName: null,
    targetTitle: null,
    platform: {
        title: 'Unknown platform',
        color: '#8c8c8c',
        isKnown: false,
    },
    notes: [],
};

export const TARGETS = [MAIN_TARGET, MULTI_RTMP_TARGET, OTHER_PLUGIN_TARGET];

const GOODGAME_TARGET: StreamTargetDto = {
    ...MULTI_RTMP_TARGET,
    key: 'plugin:a3f91c07',
    outputId: 'a3f91c07',
};

const TWITCH_TARGET: StreamTargetDto = {
    ...MULTI_RTMP_TARGET,
    key: 'plugin:b7c20e11',
    outputId: 'b7c20e11',
};

export const MEASURED_TARGETS = [MAIN_TARGET, GOODGAME_TARGET, TWITCH_TARGET, OTHER_PLUGIN_TARGET];
