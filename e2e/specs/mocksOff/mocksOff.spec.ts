import {expect, test} from '__e2e/fixtures';

import {REFUSED_OBS_CONNECTION_ERROR} from './consts';

test.use({expectedConsoleError: REFUSED_OBS_CONNECTION_ERROR});

test('a streamer turns the mocks off and the dock looks for the real OBS', async ({mainLayout, settingsPage}) => {
    await test.step('the banner turns the mocks off', async () => {
        await mainLayout.open();

        await mainLayout.closeUpdatedToast();

        await mainLayout.turnOffMocksButton.click();

        await expect(mainLayout.mockBanner).toBeHidden();

        await expect(mainLayout.offlineStatus).toBeVisible();
    });

    await test.step('the settings show the mocks off too', async () => {
        await mainLayout.settingsButton.click();

        await settingsPage.setGroupExpanded('Diagnostics', true);

        await expect(settingsPage.mockSwitch).not.toBeChecked();
    });
});
