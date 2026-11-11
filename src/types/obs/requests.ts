export type ObsRequestDto = {
    requestType: string;
    requestData?: Record<string, unknown>;
};

type ObsRequestStatusDto = {
    result: boolean;
    code: number;
    comment?: string;
};

export type ObsRequestResultDto<ResponseData = unknown> = {
    requestType: string;
    requestStatus: ObsRequestStatusDto;
    responseData?: ResponseData;
};

export type RequestResultPairDto = {
    request: ObsRequestDto;
    result?: ObsRequestResultDto;
};

export type ProfileParameterKeyDto = {
    parameterCategory: string;
    parameterName: string;
};
