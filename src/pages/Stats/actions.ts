import {bindActionCreators} from '@reduxjs/toolkit';

import store from '__store';

import {injectedAdviceModalSlice} from './reducers';

export const actions = {
    adviceModal: bindActionCreators(injectedAdviceModalSlice.actions, store.dispatch),
};
