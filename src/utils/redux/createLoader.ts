import {RequestActionsDto} from '__types/api/request';

export const createLoader = <Data, Params = void>(
    {pending, success, failed}: RequestActionsDto<Data>,
    request: (params: Params) => Promise<Data>,
) => async (params: Params) => {
    pending();

    try {
        success(await request(params));
    } catch (error) {
        failed(error instanceof Error ? error.message : String(error));
    }
};
