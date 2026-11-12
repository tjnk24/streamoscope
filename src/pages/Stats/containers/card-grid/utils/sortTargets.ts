import sortBy from 'lodash/sortBy';

import {StreamTargetDto} from '__types/targets';

export const sortTargets = (targets: StreamTargetDto[], cardOrder: string[]) => {
    const getPosition = ({key}: StreamTargetDto) => {
        const position = cardOrder.indexOf(key);

        return position === -1 ? cardOrder.length : position;
    };

    return sortBy(targets, getPosition);
};
