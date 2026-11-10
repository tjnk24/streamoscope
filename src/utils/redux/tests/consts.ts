import {RequestStateDto} from '__types/api/request';

export const DATA = ['0.7.0', '0.6.0'];

export const PARAMS: Record<string, number> = {page: 2};

export const INITIAL_STATE: RequestStateDto<string[]> = {
    status: null,
    data: null,
    error: null,
};
