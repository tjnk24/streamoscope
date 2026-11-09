import {OutputStateDto} from '__types/stats/tracking';
import {OFF_OUTPUT_VIEW, RECENT_WINDOW_SEC} from '__utils/consts';

import {AdviceTracker} from '../AdviceTracker';
import {RecentCounter} from '../RecentCounter';

export const createOutputState = (): OutputStateDto => ({
    previous: null,
    graph: [],
    recent: new RecentCounter(RECENT_WINDOW_SEC),
    advice: new AdviceTracker(),
    view: OFF_OUTPUT_VIEW,
});
