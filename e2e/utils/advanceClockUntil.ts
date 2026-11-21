import {expect, type Page} from '@playwright/test';

import {ANIMATION_CLOCK_STEP_MS, ANIMATION_WAIT_MS} from '../consts';

export const advanceClockUntil = async (page: Page, condition: (timeout: number) => Promise<void>) => {
    let clockAdvancedMs = 0;

    await expect(async () => {
        if (clockAdvancedMs < ANIMATION_WAIT_MS) {
            await page.clock.runFor(ANIMATION_CLOCK_STEP_MS);

            clockAdvancedMs += ANIMATION_CLOCK_STEP_MS;
        }

        await condition(ANIMATION_CLOCK_STEP_MS);
    }).toPass();

    if (clockAdvancedMs < ANIMATION_WAIT_MS) {
        await page.clock.runFor(ANIMATION_WAIT_MS - clockAdvancedMs);
    }
};
