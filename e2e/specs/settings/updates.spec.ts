import {expect, test} from '__e2e/fixtures';

import {
    CORS_HEADERS,
    CURRENT_RELEASE,
    LATEST_RELEASE_URL,
    NEWER_RELEASE,
    NEWER_VERSION,
} from './consts';

test.beforeEach(async ({mainLayout, settingsPage}) => {
    await mainLayout.open();

    await mainLayout.closeUpdatedToast();

    await mainLayout.settingsButton.click();

    await settingsPage.setGroupExpanded('Updates', true);
});

test('Check for updates says so when this version is the latest', async ({page, settingsPage}) => {
    await page.route(LATEST_RELEASE_URL, route => route.fulfill({json: CURRENT_RELEASE, headers: CORS_HEADERS}));

    await settingsPage.checkUpdatesButton.click();

    await expect(page.getByText('You have the latest version', {exact: true})).toBeVisible();
});

test('Check for updates finds a newer version', async ({page, settingsPage}) => {
    await page.route(LATEST_RELEASE_URL, route => route.fulfill({json: NEWER_RELEASE, headers: CORS_HEADERS}));

    await settingsPage.checkUpdatesButton.click();

    await expect(page.getByText(`Version ${NEWER_VERSION} is out`, {exact: true})).toBeVisible();
});

test('turning the automatic updates on checks GitHub at once', async ({page, settingsPage}) => {
    await page.route(LATEST_RELEASE_URL, route => route.fulfill({json: CURRENT_RELEASE, headers: CORS_HEADERS}));

    await test.step('the switch turns on and the check runs', async () => {
        await expect(settingsPage.autoUpdateSwitch).not.toBeChecked();

        await settingsPage.autoUpdateSwitch.click();

        await expect(settingsPage.autoUpdateSwitch).toBeChecked();

        await expect(page.getByText('You have the latest version', {exact: true})).toBeVisible();
    });

    await test.step('the switch turns off', async () => {
        await settingsPage.autoUpdateSwitch.click();

        await expect(settingsPage.autoUpdateSwitch).not.toBeChecked();
    });
});
