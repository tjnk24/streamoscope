import type {DraggableSyntheticListeners} from '@dnd-kit/core';
import {StatisticProps, TagProps} from 'antd';
import type {ParseKeys} from 'i18next';
import type {Nullable} from 'infrastructure/common';

import {OutputStatKeyEnum} from '__types/stats/statKeys';
import {GraphPointDto} from '__types/stats/views';
import {NoteDto, StreamTargetDto} from '__types/targets';

import {StatItemDto} from '../../components/stat-list';
import {PlatformMarkDto} from '../../types';

export type TargetSourceDto = {
    text: string;
    hint: string;
    color: Nullable<string>;
};

export type HealthTagDto = Pick<TagProps, 'color' | 'variant'>;

export type OutputCardViewDto = {
    title: string;
    targetTitle: Nullable<string>;
    color: string;
    notes: NoteDto[];
    hasReconnectAdvice: boolean;
    hasDragHandle: boolean;
    platformMark: Nullable<PlatformMarkDto>;
    isStatusShown: boolean;
    healthTag: HealthTagDto;
    statusKey: ParseKeys;
    isActive: boolean;
    isWaitingForStream: boolean;
    isBitrateShown: boolean;
    bitrate: StatisticProps['value'];
    isBitrateLoading: boolean;
    graph: GraphPointDto[];
    now: number;
    items: StatItemDto<OutputStatKeyEnum>[];
};

interface OwnProps {
    target: StreamTargetDto;
    isDragging: boolean;
    listeners: DraggableSyntheticListeners;
    setActivatorNodeRef: (element: Nullable<HTMLElement>) => void;
}

export type Props = OwnProps;
