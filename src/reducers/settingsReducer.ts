import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import isPlainObject from 'lodash/isPlainObject';
import omit from 'lodash/omit';

import {storageService} from '__services/storageService';
import {CardPlatformChoiceDto, SettingsDto} from '__types/app/settings';
import {LanguageEnum} from '__types/i18n/language';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '__types/stats/statKeys';
import {ThemeModeEnum} from '__types/theme';

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
        setIsShowOutputCards: (state, {payload}: PayloadAction<boolean>) => {
            state.isShowOutputCards = payload;
        },
        setLanguage: (state, {payload}: PayloadAction<LanguageEnum>) => {
            state.language = payload;
        },
        setThemeMode: (state, {payload}: PayloadAction<ThemeModeEnum>) => {
            state.themeMode = payload;
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
        setCardPlatform: (state, {payload}: PayloadAction<CardPlatformChoiceDto>) => {
            const {cardKey, platform, keyId} = payload;

            if (!isPlainObject(state.cardPlatforms)) {
                state.cardPlatforms = {};
            }

            state.cardPlatforms[cardKey] = {platform, keyId};
        },
        resetCardPlatform: (state, {payload}: PayloadAction<string>) => {
            state.cardPlatforms = isPlainObject(state.cardPlatforms) ? omit(state.cardPlatforms, payload) : {};
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
