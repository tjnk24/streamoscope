import {defineConfig} from '@playwright/test';

const isCi = Boolean(process.env.CI);

export default defineConfig({
    testDir: './e2e/specs',
    tsconfig: './e2e/tsconfig.json',
    snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{projectName}/{arg}{ext}',
    fullyParallel: true,
    forbidOnly: isCi,
    retries: 0,
    reporter: [
        ['list'],
        ['html', {open: 'never'}],
    ],
    use: {
        locale: 'en-US',
        timezoneId: 'UTC',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        },
    },
    projects: [
        {
            name: 'dock-300',
            use: {
                viewport: {
                    width: 300,
                    height: 900,
                },
            },
        },
        {
            name: 'dock-670',
            use: {
                viewport: {
                    width: 670,
                    height: 900,
                },
            },
        },
    ],
});
