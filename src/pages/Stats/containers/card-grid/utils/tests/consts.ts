import {OutputOriginEnum, StreamTargetDto} from '__types/targets';

const {Main, Plugin} = OutputOriginEnum;

const MAIN_TARGET: StreamTargetDto = {
    key: 'main',
    origin: Main,
    outputName: null,
    pluginName: null,
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
    pluginName: 'multi-rtmp',
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
    pluginName: null,
    platform: {
        title: 'Unknown platform',
        color: '#8c8c8c',
        isKnown: false,
    },
    notes: [],
};

export const TARGETS = [MAIN_TARGET, MULTI_RTMP_TARGET, OTHER_PLUGIN_TARGET];
