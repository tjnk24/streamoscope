import {AdviceEnum} from '__types/stats/views';
import {ADVICE_DELAY_MS} from '__utils/consts';

export class AdviceTracker {
    private readonly shown = new Set<AdviceEnum>();

    private readonly changedAt = new Map<AdviceEnum, number>();

    reset() {
        this.shown.clear();
        this.changedAt.clear();
    }

    update(now: number, activeAdvices: AdviceEnum[]) {
        Object.values(AdviceEnum).forEach(advice => {
            const isActive = activeAdvices.includes(advice);

            if (isActive === this.shown.has(advice)) {
                this.changedAt.delete(advice);

                return;
            }

            const changedAt = this.changedAt.get(advice) ?? now;

            this.changedAt.set(advice, changedAt);

            if (now - changedAt < ADVICE_DELAY_MS) {
                return;
            }

            if (isActive) {
                this.shown.add(advice);
            } else {
                this.shown.delete(advice);
            }

            this.changedAt.delete(advice);
        });

        return Object.values(AdviceEnum).filter(advice => this.shown.has(advice));
    }
}
