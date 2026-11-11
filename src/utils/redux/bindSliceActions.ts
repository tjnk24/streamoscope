import {bindActionCreators, Slice} from '@reduxjs/toolkit';
import mapValues from 'lodash/mapValues';

import store from '__store';
import {BoundSliceActionsDto} from '__types/app/slices';

export const bindSliceActions = <Slices extends Record<string, Slice>>(slices: Slices) => {
    const boundActions = mapValues(slices, slice => bindActionCreators(slice.actions, store.dispatch));

    return boundActions as BoundSliceActionsDto<Slices>;
};
