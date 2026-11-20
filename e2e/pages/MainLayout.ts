import type {Locator, Page} from '@playwright/test';

import {
    DOCK_URL,
    FIRST_POLL_WAIT_MS,
    TOAST_CLOSE_WAIT_MS,
} from '../consts';

export class MainLayout {
    readonly connectedStatus: Locator;

    readonly offlineStatus: Locator;

    readonly settingsButton: Locator;

    readonly backToStatsButton: Locator;

    readonly mockBanner: Locator;

    readonly turnOffMocksButton: Locator;

    readonly updatedToast: Locator;

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;

        this.connectedStatus = page.getByText('OBS connected', {exact: true});

        this.offlineStatus = page.getByText('No connection to OBS', {exact: true});

        this.settingsButton = page.getByRole('button', {name: 'Settings', exact: true});

        this.backToStatsButton = page.getByRole('button', {name: 'Back to stats'});

        this.mockBanner = page.getByRole('alert').filter({hasText: 'Mocks are on'});

        this.turnOffMocksButton = this.mockBanner.getByRole('button', {name: 'Turn off'});

        this.updatedToast = page.getByRole('alert').filter({hasText: 'StreamoScope updated to'});
    }

    open = async () => {
        await this.page.goto(DOCK_URL);

        await this.page.clock.runFor(FIRST_POLL_WAIT_MS);
    };

    closeUpdatedToast = async () => {
        await this.updatedToast.getByRole('button', {name: 'Close'}).click();

        await this.page.clock.runFor(TOAST_CLOSE_WAIT_MS);
    };
}
