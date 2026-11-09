import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ReleaseDto} from '__types/update/release';

type ReleaseNotesReducer = {
    isPending: boolean;
    isFailed: boolean;
    releases: ReleaseDto[];
};

const initialState: ReleaseNotesReducer = {
    isPending: false,
    isFailed: false,
    releases: [],
};

const slice = createSlice({
    name: 'releaseNotes',
    initialState,
    reducers: {
        setPending: () => ({
            ...initialState,
            isPending: true,
        }),
        setReleases: (_state, {payload}: PayloadAction<ReleaseDto[]>) => ({
            ...initialState,
            releases: payload,
        }),
        setFailed: () => ({
            ...initialState,
            isFailed: true,
        }),
        reset: () => initialState,
    },
});

export default slice;
