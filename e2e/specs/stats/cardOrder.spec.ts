import {expect, test} from '__e2e/fixtures';

import {DRAGGED_CARD_TITLE} from './consts';

test('a streamer drags a card to the top and the order stays', async ({mainLayout, statsPage}) => {
    await test.step('the main stream card is first, the GoodGame card second', async () => {
        await mainLayout.open();

        await mainLayout.closeUpdatedToast();

        await expect(statsPage.outputCards.first()).toContainText('Main');

        await expect(statsPage.outputCards.nth(1)).toContainText(DRAGGED_CARD_TITLE);
    });

    await test.step('the GoodGame card is dragged onto the main one and goes first', async () => {
        await statsPage.dragCard(statsPage.outputCard(DRAGGED_CARD_TITLE), statsPage.mainCard);

        await expect(statsPage.outputCards.first()).toContainText(DRAGGED_CARD_TITLE);

        await expect(statsPage.outputCards.nth(1)).toContainText('Main');
    });

    await test.step('the order stays after a trip to the settings', async () => {
        await mainLayout.settingsButton.click();

        await mainLayout.backToStatsButton.click();

        await expect(statsPage.outputCards.first()).toContainText(DRAGGED_CARD_TITLE);
    });
});
