import {expect, test} from '__e2e/fixtures';

import {
    LIVE_CARD_TITLES,
    STREAMS_START_WAIT_MS,
    WAITING_CARD_TITLES,
} from './consts';

test('a streamer opens the dock with mocks and goes live', async ({page, mainLayout, statsPage}) => {
    await test.step('the dock connects to the mock OBS and greets with the update toast', async () => {
        await mainLayout.open();

        await expect(mainLayout.connectedStatus).toBeVisible();

        await expect(mainLayout.mockBanner).toBeVisible();

        await expect(mainLayout.updatedToast).toBeVisible();

        await mainLayout.closeUpdatedToast();

        await expect(mainLayout.updatedToast).toBeHidden();
    });

    await test.step('before the first stream every known stream has an empty card', async () => {
        await expect(statsPage.mainCard).toContainText('Offline');

        for (const title of WAITING_CARD_TITLES) {
            await expect(statsPage.outputCard(title), `the waiting card "${title}"`).toContainText('Offline');
        }

        await expect(statsPage.sameKeyWarning).toBeVisible();

        await expect(statsPage.generalCard).toBeVisible();

        await expect(page).toHaveScreenshot('before-streams.png', {fullPage: true});
    });

    await test.step('once the streams start every platform shows its bitrate', async () => {
        await page.clock.runFor(STREAMS_START_WAIT_MS);

        await expect(statsPage.mainCard).toContainText('kbps');

        for (const title of LIVE_CARD_TITLES) {
            await expect(statsPage.outputCard(title), `the live card "${title}"`).toContainText('kbps');
        }

        await expect(statsPage.outputCard('Copy of main')).toContainText('Offline');

        await expect(page).toHaveScreenshot('live.png', {fullPage: true});

        await expect(page.locator('body')).toMatchAriaSnapshot({name: 'live.aria.yml'});
    });
});
