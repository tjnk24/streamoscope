import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {RequestStateDto, RequestStatusEnum} from '__types/api/request';

const {Pending, Success, Failed} = RequestStatusEnum;

export const createRequestSlice = <Data>(name: string) => {
    const initialState: RequestStateDto<Data> = {
        status: null,
        data: null,
        error: null,
    };

    return createSlice({
        name,
        initialState,
        reducers: {
            pending: (): RequestStateDto<Data> => ({
                ...initialState,
                status: Pending,
            }),
            success: (_state, {payload}: PayloadAction<Data>): RequestStateDto<Data> => ({
                ...initialState,
                status: Success,
                data: payload,
            }),
            failed: (_state, {payload}: PayloadAction<string>): RequestStateDto<Data> => ({
                ...initialState,
                status: Failed,
                error: payload,
            }),
            reset: () => initialState,
        },
    });
};
