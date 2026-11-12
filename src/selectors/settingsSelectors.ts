import {BaseStore} from '__reducers';

export const settingsSelector = (state: BaseStore) => state.settings;

export const settingsPortSelector = (state: BaseStore) => state.settings.port;

export const settingsIsShowGeneralCardSelector = (state: BaseStore) => state.settings.isShowGeneralCard;

export const settingsHasSeenGeneralCardNoticeSelector = (state: BaseStore) => state.settings.hasSeenGeneralCardNotice;

export const settingsIsMockEnabledSelector = (state: BaseStore) => state.settings.isMockEnabled;

export const settingsCardOrderSelector = (state: BaseStore) => state.settings.cardOrder;
