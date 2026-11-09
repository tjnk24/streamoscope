import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Nullable} from 'infrastructure/common';

import {ReleaseNotesModeEnum} from '../types';

type ReleaseNotesModalReducer = {
    isVisible: boolean;
    mode: ReleaseNotesModeEnum;
    url: Nullable<string>;
};

const initialState: ReleaseNotesModalReducer = {
    isVisible: false,
    mode: ReleaseNotesModeEnum.Current,
    url: null,
};

const slice = createSlice({
    name: 'releaseNotesModal',
    initialState,
    reducers: {
        setData: (_state, {payload}: PayloadAction<ReleaseNotesModalReducer>) => payload,
        reset: () => initialState,
    },
});

export default slice;
