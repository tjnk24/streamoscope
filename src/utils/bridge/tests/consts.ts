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
