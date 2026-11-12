import {BaseStore} from '__reducers';

export const statsSelector = (state: BaseStore) => state.stats;

export const statsTargetsSelector = (state: BaseStore) => state.stats.targets;
