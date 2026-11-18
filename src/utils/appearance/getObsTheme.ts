import type {Nullable} from 'infrastructure/common';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsProfileParameterDto} from '__types/obs/responses';
import {parseBridgeData} from '__utils/bridge/parseBridgeData';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

import {parseObsTheme} from './parseObsTheme';

export const getObsTheme = (pairs: RequestResultPairDto[], sceneCollection: Nullable<string>) => {
    const parameter = findResultData<ObsProfileParameterDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetProfileParameter));

    return parseObsTheme(parseBridgeData(parameter, sceneCollection)?.theme);
};
