import {bindActionCreators} from '@reduxjs/toolkit';

import store from '__store';

import {injectedReleaseNotesModalSlice, injectedReleaseNotesSlice} from './reducers';

export const actions = {
    releaseNotesModal: bindActionCreators(injectedReleaseNotesModalSlice.actions, store.dispatch),
    releaseNotes: bindActionCreators(injectedReleaseNotesSlice.actions, store.dispatch),
};
