import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {storageService} from '__services/storageService';
import {SettingsDto} from '__types/app/settings';
import {LanguageEnum} from '__types/i18n/language';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '__types/stats/statKeys';

import {SETTINGS_SLICE_NAME} from './consts';

export type SettingsReducer = SettingsDto;

const slice = createSlice({
    name: SETTINGS_SLICE_NAME,
    initialState: storageService.loadSettings,
    reducers: {
        setPort: (state, {payload}: PayloadAction<number>) => {
            state.port = payload;
        },
        setIsShowGeneralCard: (state, {payload}: PayloadAction<boolean>) => {
            state.isShowGeneralCard = payload;
        },
        setHasSeenGeneralCardNotice: (state, {payload}: PayloadAction<boolean>) => {
            state.hasSeenGeneralCardNotice = payload;
        },
        setLanguage: (state, {payload}: PayloadAction<LanguageEnum>) => {
            state.language = payload;
        },
        setIsMockEnabled: (state, {payload}: PayloadAction<boolean>) => {
            state.isMockEnabled = payload;
        },
        setIsAutoUpdateEnabled: (state, {payload}: PayloadAction<boolean>) => {
            state.isAutoUpdateEnabled = payload;
        },
        setIsJournalEnabled: (state, {payload}: PayloadAction<boolean>) => {
            state.isJournalEnabled = payload;
        },
        setLastUpdateCheckAt: (state, {payload}: PayloadAction<number>) => {
            state.lastUpdateCheckAt = payload;
        },
        setLastNotifiedVersion: (state, {payload}: PayloadAction<string>) => {
            state.lastNotifiedVersion = payload;
        },
        setCardOrder: (state, {payload}: PayloadAction<string[]>) => {
            state.cardOrder = payload;
        },
        setHiddenOutputStats: (state, {payload}: PayloadAction<OutputStatKeyEnum[]>) => {
            state.hiddenOutputStats = payload;
        },
        setHiddenGeneralStats: (state, {payload}: PayloadAction<GeneralStatKeyEnum[]>) => {
            state.hiddenGeneralStats = payload;
        },
    },
});

export default slice;
