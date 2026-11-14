import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {ObsOutputListDto} from '__types/obs/responses';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

export const hasStreamOutput = (pairs: RequestResultPairDto[]) => {
    const outputList = findResultData<ObsOutputListDto>(pairs, isRequestOfType(ObsRequestTypeEnum.GetOutputList));

    return Boolean(outputList?.outputs?.some(({outputFlags}) => outputFlags?.OBS_OUTPUT_SERVICE));
};
