import {HealthLevelEnum} from '__types/stats/views';

import {PlatformMarkDto} from '../../types';

import {HealthTagDto} from './types';

const {Ok, Warn, Bad, Off} = HealthLevelEnum;

export const PLATFORM_MARKS: Partial<Record<string, PlatformMarkDto>> = {
    'VK Video Live': {
        emoji: '💩',
        hintKey: 'stats.crappyPlatform',
    },
};

export const HEALTH_TAGS: Record<HealthLevelEnum, HealthTagDto> = {
    [Ok]: {color: 'success', variant: 'solid'},
    [Warn]: {color: 'warning', variant: 'solid'},
    [Bad]: {color: 'error', variant: 'solid'},
    [Off]: {color: 'default', variant: 'filled'},
};
