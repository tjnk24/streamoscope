import {Slice} from '@reduxjs/toolkit';
import mapValues from 'lodash/mapValues';

import {rootReducer} from '__reducers';
import {InjectedSlicesDto} from '__types/app/slices';

export const injectSlices = <Slices extends Record<string, Slice>>(slices: Slices) => {
    const injectedSlices = mapValues(slices, slice => slice.injectInto(rootReducer));

    return injectedSlices as InjectedSlicesDto<Slices>;
};
