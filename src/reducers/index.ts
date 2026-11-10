import {combineSlices} from '@reduxjs/toolkit';

import connectionSlice, {ConnectionReducer} from './connectionReducer';
import settingsSlice, {SettingsReducer} from './settingsReducer';
import statsSlice, {StatsReducer} from './statsReducer';
import updateSlice, {UpdateReducer} from './updateReducer';

export type BaseStore = {
    connection: ConnectionReducer;
    stats: StatsReducer;
    settings: SettingsReducer;
    update: UpdateReducer;
};

const reducers = {
    connection: connectionSlice.reducer,
    stats: statsSlice.reducer,
    settings: settingsSlice.reducer,
    update: updateSlice.reducer,
};

export const rootReducer = combineSlices(reducers);

export const actionCreators = {
    connection: connectionSlice.actions,
    stats: statsSlice.actions,
    settings: settingsSlice.actions,
    update: updateSlice.actions,
};
