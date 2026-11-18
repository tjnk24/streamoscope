import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Nullable} from 'infrastructure/common';

import {storageService} from '__services/storageService';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {ObsVersionDto} from '__types/obs/responses';
import {ObsThemeDto} from '__types/theme';
import {parseObsTheme} from '__utils/appearance/parseObsTheme';

export type ConnectionReducer = {
    status: ConnectionStatusEnum;
    obsVersion: Nullable<ObsVersionDto>;
    sceneCollection: Nullable<string>;
    isSwitchingCollection: boolean;
    reconnectAt: Nullable<number>;
    lastCloseCode: Nullable<number>;
    obsTheme: Nullable<ObsThemeDto>;
};

const createInitialState = (): ConnectionReducer => {
    const pageObsTheme = typeof window === 'undefined' ? null : parseObsTheme(window.STREAMOSCOPE_OBS_THEME);

    return {
        status: ConnectionStatusEnum.Connecting,
        obsVersion: null,
        sceneCollection: null,
        isSwitchingCollection: false,
        reconnectAt: null,
        lastCloseCode: null,
        obsTheme: pageObsTheme ?? storageService.loadObsTheme(),
    };
};

const slice = createSlice({
    name: 'connection',
    initialState: createInitialState,
    reducers: {
        setStatus: (state, {payload}: PayloadAction<ConnectionStatusEnum>) => {
            state.status = payload;
        },
        setObsVersion: (state, {payload}: PayloadAction<Nullable<ObsVersionDto>>) => {
            state.obsVersion = payload;
        },
        setSceneCollection: (state, {payload}: PayloadAction<Nullable<string>>) => {
            state.sceneCollection = payload;
        },
        setIsSwitchingCollection: (state, {payload}: PayloadAction<boolean>) => {
            state.isSwitchingCollection = payload;
        },
        setLastCloseCode: (state, {payload}: PayloadAction<number>) => {
            state.lastCloseCode = payload;
        },
        setReconnectAt: (state, {payload}: PayloadAction<Nullable<number>>) => {
            state.reconnectAt = payload;
        },
        setObsTheme: (state, {payload}: PayloadAction<ObsThemeDto>) => {
            state.obsTheme = payload;
        },
    },
});

export default slice;
