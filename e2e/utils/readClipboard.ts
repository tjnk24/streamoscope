import type {Page} from '@playwright/test';

export const readClipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());
