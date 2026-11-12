import type {DndContextProps} from '@dnd-kit/core';
import type {ParseKeys} from 'i18next';

export type CardDragAccessibilityDto = NonNullable<DndContextProps['accessibility']>;

export type AdviceTextKeysDto = {
    titleKey: ParseKeys;
    textKey: ParseKeys;
    stepKeys: ParseKeys[];
};
