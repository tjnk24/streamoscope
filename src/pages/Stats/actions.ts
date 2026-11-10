import {bindSliceActions} from '__utils/redux/bindSliceActions';

import {injectedSlices} from './reducers';

export const actions = bindSliceActions(injectedSlices);
