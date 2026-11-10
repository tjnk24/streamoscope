import {injectSlices} from '__utils/redux/injectSlices';

import adviceModalSlice from './adviceModalReducer';

export const injectedSlices = injectSlices({
    adviceModal: adviceModalSlice,
});
