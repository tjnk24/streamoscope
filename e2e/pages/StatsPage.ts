import type {Locator, Page} from '@playwright/test';

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
}
