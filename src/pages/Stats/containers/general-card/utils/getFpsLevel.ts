import type {Nullable} from 'infrastructure/common';

import {HealthLevelEnum} from '__types/stats/views';

import {FPS_BAD_SHARE, FPS_WARN_SHARE} from '../consts';

const {Warn, Bad} = HealthLevelEnum;

export const getFpsLevel = (fps: number, targetFps: Nullable<number>) => {
    if (!targetFps) {
        return undefined;
    }

    if (fps < targetFps * FPS_BAD_SHARE) {
        return Bad;
    }

    return fps < targetFps * FPS_WARN_SHARE ? Warn : undefined;
};
