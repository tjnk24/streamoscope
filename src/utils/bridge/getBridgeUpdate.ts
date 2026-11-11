import type {Nullable} from 'infrastructure/common';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsProfileParameterDto} from '__types/obs/responses';
import {BridgeUpdateStateDto} from '__types/update/bridgeUpdate';
import {FIRST_BRIDGE_VERSION} from '__utils/consts';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

import {parseBridgeData} from './parseBridgeData';
import {parseUpdateStatus} from './parseUpdateStatus';

export const getBridgeUpdate = (pairs: RequestResultPairDto[], sceneCollection: Nullable<string>): Nullable<BridgeUpdateStateDto> => {
    const parameter = findResultData<ObsProfileParameterDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetProfileParameter));
    const bridgeData = parseBridgeData(parameter, sceneCollection);

    if (!bridgeData) {
        return null;
    }

    return {
        isAvailable: bridgeData.update?.available === true,
        bridgeVersion: bridgeData.bridgeVersion ?? FIRST_BRIDGE_VERSION,
        status: parseUpdateStatus(bridgeData.update?.status ?? null),
        rolledBackVersion: bridgeData.update?.rolledBackVersion ?? null,
        stubVersion: bridgeData.update?.stubVersion ?? null,
    };
};
