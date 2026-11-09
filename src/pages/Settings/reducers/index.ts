import {WithSlice} from '@reduxjs/toolkit';

import {rootReducer} from '__reducers';

import releaseNotesModalSlice from './releaseNotesModalReducer';
import releaseNotesSlice from './releaseNotesReducer';

export const injectedReleaseNotesModalSlice = releaseNotesModalSlice.injectInto(rootReducer);

export const injectedReleaseNotesSlice = releaseNotesSlice.injectInto(rootReducer);

declare module '__types/app/LazyLoadedSlicesDto' {
    export interface LazyLoadedSlicesDto extends WithSlice<typeof releaseNotesModalSlice>, WithSlice<typeof releaseNotesSlice> {}
}
