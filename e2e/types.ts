import type {MainLayout} from './pages/MainLayout';
import type {SettingsPage} from './pages/SettingsPage';
import type {StatsPage} from './pages/StatsPage';

type MockSettingsDto = {
    settingsVersion: number;
    language: string;
    themeMode: string;
    isMockEnabled: boolean;
    isAutoUpdateEnabled: boolean;
};

export type SettingsInitDto = {
    storageKey: string;
    settings: MockSettingsDto;
};

export type PackageJsonDto = {
    version: string;
};

export type GithubReleaseStubDto = {
    tag_name: string;
    draft: boolean;
    prerelease: boolean;
    body: string;
    html_url: string;
    published_at: string;
};

export type DockOptionsDto = {
    expectedConsoleError: RegExp | null;
};

export type DockFixturesDto = {
    mainLayout: MainLayout;
    statsPage: StatsPage;
    settingsPage: SettingsPage;
};
