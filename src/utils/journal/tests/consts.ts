import {OutputOriginEnum, StreamTargetDto} from '__types/targets';

export const TARGET: StreamTargetDto = {
    key: 'main',
    origin: OutputOriginEnum.Main,
    outputName: null,
    pluginName: null,
    platform: {
        title: 'live.example.com',
        color: '#000',
        isKnown: false,
    },
    notes: [],
};
