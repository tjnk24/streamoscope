import type {OutputViewDto} from '__types/stats/views';
import {OFF_OUTPUT_VIEW} from '__utils/consts';

export const LIVE_OUTPUT: OutputViewDto = {
    ...OFF_OUTPUT_VIEW,
    isActive: true,
    kbps: 6000,
};
