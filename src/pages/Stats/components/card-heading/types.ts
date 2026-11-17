import type {DraggableSyntheticListeners} from '@dnd-kit/core';
import type {Nullable} from 'infrastructure/common';

import {PlatformMarkDto} from '../../types';

interface OwnProps {
    title: string;
    targetTitle: Nullable<string>;
    color: string;
    platformChoices: string[];
    selectedPlatform: Nullable<string>;
    onPlatformChange: (platform: string) => void;
    platformMark: Nullable<PlatformMarkDto>;
    hasDragHandle: boolean;
    isDragging: boolean;
    listeners: DraggableSyntheticListeners;
    setActivatorNodeRef: (element: Nullable<HTMLElement>) => void;
}

export type Props = OwnProps;
