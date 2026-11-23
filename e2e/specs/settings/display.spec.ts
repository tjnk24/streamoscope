import {expect, test} from '__e2e/fixtures';

import {
    HIDDEN_GENERAL_ROW,
    HIDDEN_OUTPUT_ROW,
    KEPT_GENERAL_ROW,
    RUSSIAN_TEXTS,
} from './consts';

test.beforeEach(async ({mainLayout}) => {
    await mainLayout.open();

    await mainLayout.closeUpdatedToast();

    await mainLayout.settingsButton.click();
});

test('the card switches hide and bring back the stream cards and the OBS and PC card', async ({mainLayout, statsPage, settingsPage}) => {
    await test.step('both switches off: the stats have no cards', async () => {
        await settingsPage.outputCardsSwitch.click();

        await settingsPage.generalCardSwitch.click();

        await mainLayout.backToStatsButton.click();

        await expect(statsPage.outputCards).toHaveCount(0);

        await expect(statsPage.generalCard).toBeHidden();
    });

    await test.step('both switches on: the cards are back', async () => {
        await mainLayout.settingsButton.click();

        await settingsPage.outputCardsSwitch.click();

        await settingsPage.generalCardSwitch.click();

        await mainLayout.backToStatsButton.click();

        await expect(statsPage.mainCard).toBeVisible();

        await expect(statsPage.generalCard).toBeVisible();
    });
});

test('an unticked row disappears from every card and the others stay', async ({mainLayout, statsPage, settingsPage}) => {
    await settingsPage.statCheckbox(HIDDEN_OUTPUT_ROW).click();

    await settingsPage.statCheckbox(HIDDEN_GENERAL_ROW).click();

    await mainLayout.backToStatsButton.click();

    await expect(statsPage.outputCards.getByText(HIDDEN_OUTPUT_ROW, {exact: true})).toHaveCount(0);

    await expect(statsPage.generalCard.getByText(HIDDEN_GENERAL_ROW, {exact: true})).toBeHidden();

    await expect(statsPage.generalCard.getByText(KEPT_GENERAL_ROW, {exact: true})).toBeVisible();
});

test('a new language applies at once, without a reload', async ({page, settingsPage}) => {
    await test.step('the settings switch to Russian', async () => {
        await settingsPage.chooseOption(settingsPage.languageSelect, 'Русский');

        await expect(settingsPage.groupHeader('Отображение')).toBeVisible();
    });

    await test.step('the header, the banner and the cards speak Russian', async () => {
        await page.getByRole('button', {name: 'К статистике'}).click();

        for (const text of RUSSIAN_TEXTS) {
            await expect(page.getByText(text, {exact: true}).first(), `the text "${text}"`).toBeVisible();
        }
    });
});

test('the light colors keep the stats readable', async ({page, mainLayout, settingsPage}) => {
    await settingsPage.chooseOption(settingsPage.colorsSelect, 'Light');

    await mainLayout.backToStatsButton.click();

    await expect(page).toHaveScreenshot('light-colors.png', {fullPage: true});
});
