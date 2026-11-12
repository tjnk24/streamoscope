import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {rectSortingStrategy, SortableContext} from '@dnd-kit/sortable';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import {settingsCardOrderSelector} from '__selectors/settingsSelectors';
import {statsTargetsSelector} from '__selectors/statsSelectors';
import {obsConnectionService} from '__services/obsConnectionService';

import {CARD_DRAG_ACCESSIBILITY, CARD_POINTER_SENSOR_OPTIONS} from '../../consts';
import SortableCard from '../sortable-card';

import {moveCardKey} from './utils/moveCardKey';
import {sortTargets} from './utils/sortTargets';

import style from './style.module.scss';

const CardGrid = () => {
    const targets = useSelector(statsTargetsSelector);
    const cardOrder = useSelector(settingsCardOrderSelector);

    const pointerSensor = useSensor(PointerSensor, CARD_POINTER_SENSOR_OPTIONS);

    const sensors = useSensors(pointerSensor);

    const sortedTargets = sortTargets(targets, cardOrder);

    const cardKeys = sortedTargets.map(({key}) => key);

    const onDragEnd = ({active, over}: DragEndEvent) => {
        obsConnectionService.resumeView();

        if (!over || active.id === over.id) {
            return;
        }

        const newOrder = moveCardKey(cardOrder, cardKeys, String(active.id), String(over.id));

        commonActions.settings.setCardOrder(newOrder);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            accessibility={CARD_DRAG_ACCESSIBILITY}
            onDragStart={obsConnectionService.pauseView}
            onDragEnd={onDragEnd}
            onDragCancel={obsConnectionService.resumeView}
        >
            <SortableContext
                items={cardKeys}
                strategy={rectSortingStrategy}
            >
                <div className={style.cards}>
                    {sortedTargets.map(target => (
                        <SortableCard
                            key={target.key}
                            target={target}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default CardGrid;
