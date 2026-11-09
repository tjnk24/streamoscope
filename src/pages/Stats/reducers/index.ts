import {rootReducer} from '__reducers';

import adviceModalSlice from './adviceModalReducer';

export const injectedAdviceModalSlice = adviceModalSlice.injectInto(rootReducer);
