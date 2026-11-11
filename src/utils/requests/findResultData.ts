import {ObsRequestDto, RequestResultPairDto} from '__types/obs/requests';

export const findResultData = <ResultData>(pairs: RequestResultPairDto[], predicate: (request: ObsRequestDto) => boolean) => {
    const pair = pairs.find(({request}) => predicate(request));

    return pair?.result?.requestStatus.result ? pair.result.responseData as ResultData : null;
};
