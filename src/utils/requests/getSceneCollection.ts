import type {Nullable} from 'infrastructure/common';
import isString from 'lodash/isString';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsSceneCollectionListDto} from '__types/obs/responses';

import {findResultData} from './findResultData';
import {isRequestOfType} from './isRequestOfType';

export const getSceneCollection = (pairs: RequestResultPairDto[]): Nullable<string> => {
    const list = findResultData<ObsSceneCollectionListDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetSceneCollectionList));

    const sceneCollectionName = list?.currentSceneCollectionName;

    return isString(sceneCollectionName) ? sceneCollectionName : null;
};
