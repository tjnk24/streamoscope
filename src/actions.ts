import {commonSlices} from '__reducers';
import {bindSliceActions} from '__utils/redux/bindSliceActions';

export const commonActions = bindSliceActions(commonSlices);
