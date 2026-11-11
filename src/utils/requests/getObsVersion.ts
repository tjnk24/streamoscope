import type {Nullable} from 'infrastructure/common';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsVersionDto} from '__types/obs/responses';

import {findResultData} from './findResultData';
import {isRequestOfType} from './isRequestOfType';

export const getObsVersion = (pairs: RequestResultPairDto[]): Nullable<ObsVersionDto> => {
    const data = findResultData<ObsVersionDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetVersion));

    if (!data) {
        return null;
    }

    const {
        obsVersion,
        obsWebSocketVersion,
        platformDescription,
        rpcVersion,
        availableRequests,
    } = data;

    return {obsVersion, obsWebSocketVersion, platformDescription, rpcVersion, availableRequests};
};
