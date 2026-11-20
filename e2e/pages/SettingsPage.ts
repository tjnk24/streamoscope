import type {Locator, Page} from '@playwright/test';

export class SettingsPage {
    readonly mockSwitch: Locator;

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;

        this.mockSwitch = page.getByRole('switch', {name: /^Enable mocks/});
    }

    groupHeader = (name: string) => this.page.getByRole('button', {name, exact: true});

    scrollToTop = async () => {
        await this.page.evaluate(() => document.scrollingElement?.scrollTo(0, 0));
    };

    setGroupExpanded = async (name: string, isExpanded: boolean) => {
        const header = this.groupHeader(name);

        if (await header.getAttribute('aria-expanded') !== String(isExpanded)) {
            await header.click();
        }
    };
}
