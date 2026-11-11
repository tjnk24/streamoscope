import last from 'lodash/last';

import {RecentSampleDto} from '__types/stats/tracking';

export class RecentCounter {
    private samples: RecentSampleDto[] = [];

    constructor(private readonly windowSec: number) {}

    reset() {
        this.samples = [];
    }

    add(time: number, count: number, total: number) {
        const lastSample = last(this.samples);

        if (lastSample && (count < lastSample.count || total < lastSample.total)) {
            this.samples = [];
        }

        this.samples.push({time, count, total});

        while (this.samples.length > 2 && this.samples[1].time <= time - (this.windowSec * 1000)) {
            this.samples.shift();
        }

        const first = this.samples[0];

        return {count: count - first.count, total: total - first.total};
    }
}
