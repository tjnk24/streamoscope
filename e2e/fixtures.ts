import {expect, test as base} from '@playwright/test';

import {
    CLOCK_INSTALL_TIME,
    MISSING_OBS_THEME_ERROR,
    NETWORK_REQUEST_PATTERN,
    RANDOM_SEED,
    SETTINGS_INIT,
    START_TIME,
} from './consts';
import {MainLayout} from './pages/MainLayout';
import {SettingsPage} from './pages/SettingsPage';
import {StatsPage} from './pages/StatsPage';
import type {DockFixturesDto, DockOptionsDto} from './types';
import {installSeededRandom} from './utils/installSeededRandom';
import {storeSettings} from './utils/storeSettings';

export const test = base.extend<DockOptionsDto & DockFixturesDto>({
    expectedConsoleError: [null, {option: true}],

    page: async ({page, expectedConsoleError}, use) => {
        const problems: string[] = [];

        page.on('console', message => {
            const text = `${message.text()} (${message.location().url})`;

            const isExpected = MISSING_OBS_THEME_ERROR.test(text) || expectedConsoleError?.test(text) === true;

            if (message.type() === 'error' && !isExpected) {
                problems.push(`console error: ${text}`);
            }
        });

        page.on('pageerror', error => problems.push(`uncaught error: ${error.message}`));

        await page.route(NETWORK_REQUEST_PATTERN, route => {
            problems.push(`request to the network: ${route.request().url()}`);

            return route.abort();
        });

        await page.addInitScript(installSeededRandom, RANDOM_SEED);

        await page.addInitScript(storeSettings, SETTINGS_INIT);

        await page.clock.install({time: CLOCK_INSTALL_TIME});

        await page.clock.pauseAt(START_TIME);

        await use(page);

        expect(problems, 'the dock logged errors or went to the network').toEqual([]);
    },

    mainLayout: async ({page}, use) => {
        await use(new MainLayout(page));
    },

    statsPage: async ({page}, use) => {
        await use(new StatsPage(page));
    },

    settingsPage: async ({page}, use) => {
        await use(new SettingsPage(page));
    },
});

export {expect};
