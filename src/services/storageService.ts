import type {Nullable} from 'infrastructure/common';

import {SettingsDto} from '__types/app/settings';
import {ObsThemeDto} from '__types/theme';
import {parseObsTheme} from '__utils/appearance/parseObsTheme';
import {
    DISCARDED_SETTINGS_STORAGE_KEY,
    JOURNAL_STORAGE_KEY,
    OBS_THEME_STORAGE_KEY,
    PASSWORD_STORAGE_KEY,
    SETTINGS_STORAGE_KEY,
} from '__utils/consts';
import {migrateSettings} from '__utils/settings/migrateSettings';

class StorageService {
    loadPassword = () => this.getItem(PASSWORD_STORAGE_KEY);

    savePassword = (password: Nullable<string>) => (
        password === null
            ? this.removeItem(PASSWORD_STORAGE_KEY)
            : this.setItem(PASSWORD_STORAGE_KEY, password)
    );

    loadSettings = (): SettingsDto => {
        const raw = this.getItem(SETTINGS_STORAGE_KEY);
        let stored: unknown = null;

        try {
            stored = raw === null ? null : JSON.parse(raw);
        } catch {
            stored = raw;
        }

        const {settings, isDiscarded, isChanged} = migrateSettings(stored);

        if (isDiscarded && raw !== null) {
            this.setItem(DISCARDED_SETTINGS_STORAGE_KEY, raw);
        }

        if (isChanged) {
            this.saveSettings(settings);
        }

        return settings;
    };

    saveSettings = (settings: SettingsDto) => this.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    loadJournal = () => this.getItem(JOURNAL_STORAGE_KEY)?.split('\n') ?? [];

    saveJournal = (lines: string[]) => this.setItem(JOURNAL_STORAGE_KEY, lines.join('\n'));

    loadObsTheme = () => {
        try {
            return parseObsTheme(JSON.parse(this.getItem(OBS_THEME_STORAGE_KEY) ?? 'null'));
        } catch {
            return null;
        }
    };

    saveObsTheme = (obsTheme: ObsThemeDto) => this.setItem(OBS_THEME_STORAGE_KEY, JSON.stringify(obsTheme));

    private getItem = (key: string): Nullable<string> => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    };

    private setItem = (key: string, value: string) => {
        try {
            localStorage.setItem(key, value);
        } catch {
            return;
        }
    };

    private removeItem = (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch {
            return;
        }
    };
}

export const storageService = new StorageService();
