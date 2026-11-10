import {bindActionCreators, Slice} from '@reduxjs/toolkit';

import store from '__store';
import {BoundSliceActionsDto} from '__types/app/slices';

export const bindSliceActions = <Slices extends Record<string, Slice>>(slices: Slices) => {
    const boundActions = Object.entries(slices).map(([key, slice]) => [key, bindActionCreators(slice.actions, store.dispatch)]);

    return Object.fromEntries(boundActions) as BoundSliceActionsDto<Slices>;
};
