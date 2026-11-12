import {arrayMove} from '@dnd-kit/sortable';
import difference from 'lodash/difference';

export const moveCardKey = (cardOrder: string[], shownKeys: string[], movedKey: string, targetKey: string) => {
    const newKeys = difference(shownKeys, cardOrder);

    const fullOrder = [...cardOrder, ...newKeys];

    return arrayMove(fullOrder, fullOrder.indexOf(movedKey), fullOrder.indexOf(targetKey));
};
