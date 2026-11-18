import {BaseStore} from '__reducers';

export const connectionSelector = (state: BaseStore) => state.connection;

export const connectionStatusSelector = (state: BaseStore) => state.connection.status;

export const connectionIsSwitchingCollectionSelector = (state: BaseStore) => state.connection.isSwitchingCollection;

export const connectionObsThemeSelector = (state: BaseStore) => state.connection.obsTheme;
