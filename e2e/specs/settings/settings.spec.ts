import {expect, test} from '__e2e/fixtures';

import {ANIMATION_WAIT_MS, SETTINGS_GROUPS} from './consts';

test('a streamer opens the settings and goes through every group', async ({page, mainLayout, settingsPage}) => {
    await test.step('the settings open from the header', async () => {
        await mainLayout.open();

        await mainLayout.closeUpdatedToast();

        await mainLayout.settingsButton.click();

        await expect(settingsPage.groupHeader('Display')).toHaveAttribute('aria-expanded', 'true');
    });

    await test.step('every group expands', async () => {
        for (const group of SETTINGS_GROUPS) {
            await settingsPage.setGroupExpanded(group, true);

            await page.clock.runFor(ANIMATION_WAIT_MS);

            await expect(settingsPage.groupHeader(group), `the group "${group}"`).toHaveAttribute('aria-expanded', 'true');
        }

        await expect(settingsPage.mockSwitch).toBeChecked();
    });

    await test.step('the groups look as before, without Updates: its version line changes with every commit', async () => {
        await settingsPage.setGroupExpanded('Updates', false);

        await page.clock.runFor(ANIMATION_WAIT_MS);

        await settingsPage.scrollToTop();

        await expect(page).toHaveScreenshot('settings.png', {fullPage: true});
    });

    await test.step('the header leads back to the stats', async () => {
        await mainLayout.backToStatsButton.click();

        await expect(mainLayout.settingsButton).toBeVisible();
    });
});
