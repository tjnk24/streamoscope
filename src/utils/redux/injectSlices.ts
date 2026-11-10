import {Slice} from '@reduxjs/toolkit';

import {rootReducer} from '__reducers';
import {InjectedSlicesDto} from '__types/app/slices';

export const injectSlices = <Slices extends Record<string, Slice>>(slices: Slices) => {
    const injectedSlices = Object.entries(slices).map(([key, slice]) => [key, slice.injectInto(rootReducer)]);

    return Object.fromEntries(injectedSlices) as InjectedSlicesDto<Slices>;
};
