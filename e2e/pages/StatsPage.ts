import type {Locator, Page} from '@playwright/test';

export class StatsPage {
    readonly outputCards: Locator;

    readonly mainCard: Locator;

    readonly generalCard: Locator;

    readonly sameKeyWarning: Locator;

    constructor(page: Page) {
        this.outputCards = page.getByTestId('output-card');

        this.mainCard = this.outputCards.filter({has: page.getByText('Main', {exact: true})});

        this.generalCard = page.getByTestId('general-card');

        this.sameKeyWarning = page.getByRole('alert').filter({hasText: 'already taken by the main OBS stream'});
    }

    outputCard = (title: string) => this.outputCards.filter({hasText: title});
}
