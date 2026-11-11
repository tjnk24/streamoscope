import type {Nullable} from 'infrastructure/common';

import {BridgeDataDto} from '__types/bridge';
import {ObsProfileParameterDto} from '__types/obs/responses';
import {BRIDGE_STALE_SEC} from '__utils/consts';

export const parseBridgeData = (parameter: Nullable<ObsProfileParameterDto>, sceneCollection: Nullable<string> = null): Nullable<BridgeDataDto> => {
    try {
        const data = JSON.parse(parameter?.parameterValue ?? '') as Nullable<BridgeDataDto>;

        if (data === null || typeof data.updated !== 'number' || !Array.isArray(data.outputs)) {
            return null;
        }

        const isOtherCollection = sceneCollection !== null && typeof data.sceneCollection === 'string' && data.sceneCollection !== sceneCollection;

        if ((Date.now() / 1000) - data.updated > BRIDGE_STALE_SEC || isOtherCollection) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
};
