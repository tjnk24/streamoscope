import {injectSlices} from '__utils/redux/injectSlices';

import releaseNotesModalSlice from './releaseNotesModalReducer';
import releaseNotesSlice from './releaseNotesReducer';

export const injectedSlices = injectSlices({
    releaseNotesModal: releaseNotesModalSlice,
    releaseNotes: releaseNotesSlice,
});
