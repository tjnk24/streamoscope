import type {Locator, Page} from '@playwright/test';

import {ANIMATION_WAIT_MS} from '../consts';

export class SettingsPage {
    readonly outputCardsSwitch: Locator;

    readonly generalCardSwitch: Locator;

    readonly languageSelect: Locator;

    readonly colorsSelect: Locator;

    readonly portInput: Locator;

    readonly saveAndReconnectButton: Locator;

    readonly passwordInput: Locator;

    readonly changePasswordButton: Locator;

    readonly checkUpdatesButton: Locator;

    readonly autoUpdateSwitch: Locator;

    readonly whatsNewButton: Locator;

    readonly releaseNotes: Locator;

    readonly copyDiagnosticsButton: Locator;

    readonly journalSwitch: Locator;

    readonly mockSwitch: Locator;

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;

        this.outputCardsSwitch = page.getByRole('switch', {name: 'Show stream cards'});

        this.generalCardSwitch = page.getByRole('switch', {name: 'Show the OBS card'});

        this.languageSelect = page.getByRole('combobox', {name: /Interface language$/});

        this.colorsSelect = page.getByRole('combobox', {name: /Colors$/});

        this.portInput = page.getByLabel('obs-websocket port');

        this.saveAndReconnectButton = page.getByRole('button', {name: 'Save and reconnect'});

        this.passwordInput = page.getByLabel('obs-websocket password');

        this.changePasswordButton = page.getByRole('button', {name: 'Change', exact: true});

        this.checkUpdatesButton = page.getByRole('button', {name: /Check for updates$/});

        this.autoUpdateSwitch = page.getByRole('switch', {name: /^Update automatically/});

        this.whatsNewButton = page.getByRole('button', {name: 'What\'s new', exact: true});

        this.releaseNotes = page.getByRole('dialog').filter({hasText: 'What\'s new in'});

        this.copyDiagnosticsButton = page.getByRole('button', {name: /(Copy diagnostics|Copied)$/});

        this.journalSwitch = page.getByRole('switch', {name: /^Keep a journal/});

        this.mockSwitch = page.getByRole('switch', {name: /^Enable mocks/});
    }

    groupHeader = (name: string) => this.page.getByRole('button', {name, exact: true});

    statCheckbox = (name: string) => this.page.getByRole('checkbox', {name, exact: true});

    scrollToTop = async () => {
        await this.page.evaluate(() => document.scrollingElement?.scrollTo(0, 0));
    };

    setGroupExpanded = async (name: string, isExpanded: boolean) => {
        const header = this.groupHeader(name);

        if (await header.getAttribute('aria-expanded') !== String(isExpanded)) {
            await header.click();
        }

        await this.page.clock.runFor(ANIMATION_WAIT_MS);
    };

    chooseOption = async (select: Locator, option: string) => {
        await select.click();

        await this.page.getByTitle(option, {exact: true}).click();
    };
}
