import type {Slice} from '@reduxjs/toolkit';

type SliceStateDto<SliceType extends Slice> = ReturnType<SliceType['getInitialState']>;

type SliceRootStateDto<SliceType extends Slice> = Partial<Record<SliceType['reducerPath'], SliceStateDto<SliceType>>>;

type InjectedSlicePartsDto<SliceType extends Slice> = {
    reducerPath: SliceType['reducerPath'];
    selectSlice: (state: SliceRootStateDto<SliceType>) => SliceStateDto<SliceType>;
};

type InjectedSliceDto<SliceType extends Slice> = Omit<ReturnType<SliceType['injectInto']>, 'reducerPath' | 'selectSlice'> & InjectedSlicePartsDto<SliceType>;

export type InjectedSlicesDto<Slices extends Record<string, Slice>> = {
    [Key in keyof Slices]: InjectedSliceDto<Slices[Key]>;
};

export type BoundSliceActionsDto<Slices extends Record<string, Slice>> = {
    [Key in keyof Slices]: Slices[Key]['actions'];
};
