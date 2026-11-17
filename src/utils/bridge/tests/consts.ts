import {BridgeDataDto} from '__types/bridge';
import {ObsProfileParameterDto} from '__types/obs/responses';
import {UpdateStageEnum, UpdateStatusDto} from '__types/update/bridgeUpdate';

export const UPDATE_STATUS: UpdateStatusDto = {
    version: '0.2.0',
    stage: UpdateStageEnum.Downloading,
    percent: 42,
    error: null,
    updated: 1793400000,
};

export const BRIDGE_PUBLISHED_AT = 1_800_000_000;

export const BRIDGE_SCENE_COLLECTION = 'Main scenes';

export const BRIDGE_PARAMETER: ObsProfileParameterDto = {
    parameterValue: JSON.stringify({bridgeVersion: 2, updated: BRIDGE_PUBLISHED_AT, sceneCollection: BRIDGE_SCENE_COLLECTION, outputs: []}),
};

export const OLD_BRIDGE_PARAMETER: ObsProfileParameterDto = {
    parameterValue: JSON.stringify({bridgeVersion: 1, updated: BRIDGE_PUBLISHED_AT, outputs: []}),
};

export const BRIDGE_PARAMETER_WITHOUT_TIME: ObsProfileParameterDto = {
    parameterValue: JSON.stringify({bridgeVersion: 2, updated: 'now', outputs: []}),
};

export const BRIDGE_PARAMETER_WITHOUT_OUTPUTS: ObsProfileParameterDto = {
    parameterValue: JSON.stringify({bridgeVersion: 2, updated: BRIDGE_PUBLISHED_AT}),
};

export const CONFIGURED_BRIDGE_DATA: BridgeDataDto = {
    bridgeVersion: 8,
    updated: BRIDGE_PUBLISHED_AT,
    outputs: [],
    configuredTargets: [
        {
            id: 'b7c20e11',
            name: 'multi-output',
            server: 'rtmp://live.twitch.tv',
            title: 'Main channel',
        },
        {
            id: 'a3f91c07',
            name: 'multi-output',
            server: 'rtmp://msk.goodgame.ru:1940',
        },
        {
            id: 'a3f91c07',
            name: 'multi-output',
            server: 'rtmp://msk.goodgame.ru:1940',
        },
        {
            id: '5d1e88b0',
            name: 'multi-output',
            server: 'rtmp://live.youtube.com',
        },
    ],
};
