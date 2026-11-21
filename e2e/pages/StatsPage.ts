import type {Locator, Page} from '@playwright/test';

import {
    ANIMATION_WAIT_MS,
    CARD_DRAG_START_SHIFT,
    CARD_DRAG_STEPS,
} from '../consts';

export class StatsPage {
    readonly outputCards: Locator;

    readonly mainCard: Locator;

    readonly sharedServerCard: Locator;

    readonly generalCard: Locator;

    readonly sameKeyWarning: Locator;

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;

        this.outputCards = page.getByTestId('output-card');

        this.mainCard = this.outputCards.filter({has: page.getByText('Main', {exact: true})});

        this.sharedServerCard = this.outputCards.filter({has: page.getByRole('combobox')});

        this.generalCard = page.getByTestId('general-card');

        this.sameKeyWarning = page.getByRole('alert').filter({hasText: 'already taken by the main OBS stream'});
    }

    outputCard = (title: string) => this.outputCards.filter({hasText: title});

    choosePlatform = async (platform: string) => {
        await this.sharedServerCard.getByRole('combobox').click();

        await this.page.getByTitle(platform, {exact: true}).click();
    };

    dragCard = async (card: Locator, target: Locator) => {
        const handleBox = await card.getByRole('img', {name: 'holder'}).boundingBox();

        const targetBox = await target.boundingBox();

        if (!handleBox || !targetBox) {
            throw new Error('The card or the place to drop it is not on the screen');
        }

        const handleX = handleBox.x + (handleBox.width / 2);

        const handleY = handleBox.y + (handleBox.height / 2);

        await this.page.mouse.move(handleX, handleY);

        await this.page.mouse.down();

        await this.page.mouse.move(handleX + CARD_DRAG_START_SHIFT, handleY, {steps: CARD_DRAG_STEPS});

        await this.page.mouse.move(targetBox.x + (targetBox.width / 2), targetBox.y + (targetBox.height / 2), {steps: CARD_DRAG_STEPS});

        await this.page.mouse.up();

        await this.page.clock.runFor(ANIMATION_WAIT_MS);
    };
}
