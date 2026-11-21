import {expect, test} from '__e2e/fixtures';
import {advanceClockUntil} from '__e2e/utils/advanceClockUntil';

import {OUT_OF_RANGE_PORT, PORT_RANGE_ERROR} from './consts';

test.beforeEach(async ({mainLayout, settingsPage}) => {
    await mainLayout.open();

    await mainLayout.closeUpdatedToast();

    await mainLayout.settingsButton.click();

    await settingsPage.setGroupExpanded('Connection', true);
});

test('a port out of range is not saved', async ({page, settingsPage}) => {
    await settingsPage.portInput.fill(OUT_OF_RANGE_PORT);

    await settingsPage.saveAndReconnectButton.click();

    await advanceClockUntil(page, timeout => expect(page.getByText(PORT_RANGE_ERROR)).toBeVisible({timeout}));
});

test('an empty password is not sent', async ({page, settingsPage}) => {
    await settingsPage.changePasswordButton.click();

    await advanceClockUntil(page, timeout => expect(page.getByText('Enter the password', {exact: true})).toBeVisible({timeout}));

    await expect(settingsPage.passwordInput).toBeEmpty();
});
