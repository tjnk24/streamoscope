import type {DraggableSyntheticListeners} from '@dnd-kit/core';
import {StatisticProps, TagProps} from 'antd';
import type {ParseKeys} from 'i18next';
import type {Nullable} from 'infrastructure/common';

import {GraphPointDto} from '__types/stats/views';
import {NoteDto, StreamTargetDto} from '__types/targets';

import {StatItemDto} from '../../components/stat-list';

export enum OutputStatKeyEnum {
    Source = 'source',
    Timecode = 'timecode',
    Dropped = 'dropped',
    Recent = 'recent',
    Congestion = 'congestion',
}

export type TargetSourceDto = {
    text: string;
    hint: string;
    color: Nullable<string>;
};

export type PlatformMarkDto = {
    emoji: string;
    hintKey: ParseKeys;
};

export type HealthTagDto = Pick<TagProps, 'color' | 'variant'>;

export type OutputCardViewDto = {
    title: string;
    color: string;
    notes: NoteDto[];
    hasReconnectAdvice: boolean;
    hasDragHandle: boolean;
    platformMark: Nullable<PlatformMarkDto>;
    healthTag: HealthTagDto;
    statusKey: ParseKeys;
    isActive: boolean;
    isWaitingForStream: boolean;
    bitrate: StatisticProps['value'];
    isBitrateLoading: boolean;
    graph: GraphPointDto[];
    now: number;
    items: StatItemDto[];
};

interface OwnProps {
    target: StreamTargetDto;
    isDragging: boolean;
    listeners: DraggableSyntheticListeners;
    setActivatorNodeRef: (element: Nullable<HTMLElement>) => void;
}

export type Props = OwnProps;
