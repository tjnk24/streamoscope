import type {PointerSensorOptions} from '@dnd-kit/core';
import type {ParseKeys} from 'i18next';

import {AdviceEnum} from '__types/stats/views';

import {AdviceTextKeysDto, CardDragAccessibilityDto} from './types';

const {
    Reconnecting,
    DroppedFrames,
    Congestion,
    Rendering,
    Encoding,
} = AdviceEnum;

const NETWORK_STEP_KEYS: ParseKeys[] = [
    'advice.steps.lowerBitrate',
    'advice.steps.dynamicBitrate',
    'advice.steps.cable',
    'advice.steps.closerServer',
];

export const ADVICE_TEXTS: Record<AdviceEnum, AdviceTextKeysDto> = {
    [Reconnecting]: {
        titleKey: 'advice.reconnecting.title',
        textKey: 'advice.reconnecting.text',
        stepKeys: [
            'advice.steps.checkInternet',
            'advice.steps.otherServer',
            'advice.steps.checkPlatform',
        ],
    },
    [DroppedFrames]: {
        titleKey: 'advice.droppedFrames.title',
        textKey: 'advice.droppedFrames.text',
        stepKeys: NETWORK_STEP_KEYS,
    },
    [Congestion]: {
        titleKey: 'advice.congestion.title',
        textKey: 'advice.congestion.text',
        stepKeys: NETWORK_STEP_KEYS,
    },
    [Rendering]: {
        titleKey: 'advice.rendering.title',
        textKey: 'advice.rendering.text',
        stepKeys: [
            'advice.steps.capGameFps',
            'advice.steps.runAsAdministrator',
            'advice.steps.closeHeavyApps',
            'advice.steps.lowerCanvas',
        ],
    },
    [Encoding]: {
        titleKey: 'advice.encoding.title',
        textKey: 'advice.encoding.text',
        stepKeys: [
            'advice.steps.fasterPreset',
            'advice.steps.hardwareEncoder',
            'advice.steps.lowerOutput',
        ],
    },
};

export const CARD_POINTER_SENSOR_OPTIONS: PointerSensorOptions = {
    activationConstraint: {
        distance: 5,
    },
};

export const CARD_DRAG_ACCESSIBILITY: CardDragAccessibilityDto = {
    announcements: {
        onDragStart: () => undefined,
        onDragOver: () => undefined,
        onDragEnd: () => undefined,
        onDragCancel: () => undefined,
    },
    screenReaderInstructions: {
        draggable: '',
    },
};
