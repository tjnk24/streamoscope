import {DOCK_VERSION} from '__e2e/consts';
import {expect, test} from '__e2e/fixtures';
import {advanceClockUntil} from '__e2e/utils/advanceClockUntil';

import {
    CORS_HEADERS,
    CURRENT_RELEASE,
    LATEST_RELEASE_URL,
    NEWER_RELEASE,
    NEWER_VERSION,
    RELEASE_WITH_NOTES,
    RELEASES_URL_PATTERN,
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

test('What\'s new shows the notes of this version from their markdown', async ({page, settingsPage}) => {
    await page.route(RELEASES_URL_PATTERN, route => route.fulfill({json: [RELEASE_WITH_NOTES], headers: CORS_HEADERS}));

    await test.step('the notes open with the English part only', async () => {
        await settingsPage.whatsNewButton.click();

        await advanceClockUntil(page, timeout => expect(settingsPage.releaseNotes.getByRole('heading', {name: 'Fixes'})).toBeVisible({timeout}));

        await expect(settingsPage.releaseNotes.getByRole('listitem')).toHaveText(['The cards keep their order', 'See the release page']);

        await expect(settingsPage.releaseNotes.getByText('release page', {exact: true})).toBeVisible();

        await expect(settingsPage.releaseNotes).toContainText('Run the installer once.');

        await expect(settingsPage.releaseNotes).not.toContainText('Исправления');
    });

    await test.step('the notes look as before', async () => {
        const versionTexts = [settingsPage.releaseNotes.getByText(`What's new in ${DOCK_VERSION}`), settingsPage.releaseNotes.getByText(`Version ${DOCK_VERSION}`)];

        await expect(settingsPage.releaseNotes).toHaveScreenshot('release-notes.png', {mask: versionTexts});
    });

    await test.step('Got it closes the notes', async () => {
        await settingsPage.releaseNotes.getByRole('button', {name: 'Got it'}).click();

        await advanceClockUntil(page, timeout => expect(settingsPage.releaseNotes).toBeHidden({timeout}));
    });
});
