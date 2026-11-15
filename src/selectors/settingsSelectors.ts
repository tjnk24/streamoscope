import {BaseStore} from '__reducers';

export const settingsSelector = (state: BaseStore) => state.settings;

export const settingsPortSelector = (state: BaseStore) => state.settings.port;

export const settingsIsShowGeneralCardSelector = (state: BaseStore) => state.settings.isShowGeneralCard;

export const settingsIsShowOutputCardsSelector = (state: BaseStore) => state.settings.isShowOutputCards;

export const settingsLanguageSelector = (state: BaseStore) => state.settings.language;

export const settingsIsMockEnabledSelector = (state: BaseStore) => state.settings.isMockEnabled;

export const settingsCardOrderSelector = (state: BaseStore) => state.settings.cardOrder;

export const settingsHiddenOutputStatsSelector = (state: BaseStore) => state.settings.hiddenOutputStats;

export const settingsHiddenGeneralStatsSelector = (state: BaseStore) => state.settings.hiddenGeneralStats;

export const settingsLastNotifiedVersionSelector = (state: BaseStore) => state.settings.lastNotifiedVersion;
