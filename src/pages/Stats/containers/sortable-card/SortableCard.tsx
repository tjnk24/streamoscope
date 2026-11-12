import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import cn from 'classnames';
import {useSelector} from 'react-redux';

import {statsTargetsSelector} from '__selectors/statsSelectors';

import OutputCard from '../output-card';

import {Props} from './types';

import style from './style.module.scss';

const SortableCard = ({target}: Props) => {
    const targets = useSelector(statsTargetsSelector);

    const {
        setNodeRef,
        setActivatorNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({id: target.key, disabled: targets.length < 2});

    const dragStyle = {transform: CSS.Translate.toString(transform), transition};

    return (
        <div
            ref={setNodeRef}
            className={cn(style.sortable, {[style.dragging]: isDragging})}
            style={dragStyle}
        >
            <OutputCard
                target={target}
                isDragging={isDragging}
                listeners={listeners}
                setActivatorNodeRef={setActivatorNodeRef}
            />
        </div>
    );
};

export default SortableCard;
