import {DOCK_VERSION, STREAMS_START_WAIT_MS} from '__e2e/consts';
import {expect, test} from '__e2e/fixtures';
import {readClipboard} from '__e2e/utils/readClipboard';

import {SERVER_ADDRESS_PATTERN} from './consts';

test.beforeEach(async ({mainLayout}) => {
    await mainLayout.open();

    await mainLayout.closeUpdatedToast();
});

test('Copy diagnostics copies the versions and the streams, without server addresses', async ({page, context, mainLayout, settingsPage}) => {
    await test.step('the streams are live and the diagnostics are copied', async () => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.clock.runFor(STREAMS_START_WAIT_MS);

        await mainLayout.settingsButton.click();

        await settingsPage.setGroupExpanded('Diagnostics', true);

        await settingsPage.copyDiagnosticsButton.click();

        await expect(settingsPage.copyDiagnosticsButton).toContainText('Copied');
    });

    await test.step('the clipboard has the versions and the outputs, and no addresses', async () => {
        const diagnostics = await readClipboard(page);

        expect(diagnostics).toContain(`StreamoScope: ${DOCK_VERSION}`);

        expect(diagnostics).toContain('Language: en');

        expect(diagnostics).toMatch(/YouTube: main output/);

        expect(diagnostics).not.toMatch(SERVER_ADDRESS_PATTERN);
    });
});

test('the journal switch turns the journal off', async ({mainLayout, settingsPage}) => {
    await mainLayout.settingsButton.click();

    await settingsPage.setGroupExpanded('Diagnostics', true);

    await expect(settingsPage.journalSwitch).toBeChecked();

    await settingsPage.journalSwitch.click();

    await expect(settingsPage.journalSwitch).not.toBeChecked();
});
