import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Nullable} from 'infrastructure/common';

import {AdviceEnum} from '__types/stats/views';

type AdviceModalReducer = {
    isVisible: boolean;
    advice: Nullable<AdviceEnum>;
};

const initialState: AdviceModalReducer = {
    isVisible: false,
    advice: null,
};

const slice = createSlice({
    name: 'adviceModal',
    initialState,
    reducers: {
        setData: (_state, {payload}: PayloadAction<AdviceModalReducer>) => payload,
        reset: () => initialState,
    },
});

export default slice;
