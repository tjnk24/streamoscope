import {STREAMS_START_WAIT_MS} from '__e2e/consts';
import {expect, test} from '__e2e/fixtures';

import {SHARED_SERVER_PLATFORMS} from './consts';

for (const platform of SHARED_SERVER_PLATFORMS) {
    test(`a streamer picks ${platform} for the stream on the shared VK, OK and Boosty server`, async ({page, mainLayout, statsPage}) => {
        await test.step('the shared server card asks for the platform', async () => {
            await mainLayout.open();

            await mainLayout.closeUpdatedToast();

            await page.clock.runFor(STREAMS_START_WAIT_MS);

            await expect(statsPage.sharedServerCard).toContainText('Which platform?');
        });

        await test.step('the picked platform becomes the card title', async () => {
            await statsPage.choosePlatform(platform);

            await expect(statsPage.sharedServerCard).toContainText(platform);

            await expect(statsPage.sharedServerCard).not.toContainText('Which platform?');

            await expect(statsPage.sharedServerCard).toContainText('kbps');
        });
    });
}
