import type {Nullable} from 'infrastructure/common';

import {LagStartDto} from '__types/stats/tracking';
import {LagViewDto} from '__types/stats/views';
import {RECENT_WINDOW_SEC} from '__utils/consts';

import {RecentCounter} from './RecentCounter';

export class LagCounter {
    private start: Nullable<LagStartDto> = null;

    private readonly recent = new RecentCounter(RECENT_WINDOW_SEC);

    reset() {
        this.start = null;
        this.recent.reset();
    }

    resetRecent() {
        this.recent.reset();
    }

    restart() {
        this.start = null;
    }

    add(time: number, skipped: number, total: number): LagViewDto {
        const {start} = this;
        const isStartValid = start !== null && skipped >= start.skipped && total >= start.total;
        const currentStart = isStartValid ? start : {skipped, total};
        const recent = this.recent.add(time, skipped, total);

        this.start = currentStart;

        return {
            skipped: skipped - currentStart.skipped,
            total: total - currentStart.total,
            recentSkipped: recent.count,
            recentTotal: recent.total,
        };
    }
}
