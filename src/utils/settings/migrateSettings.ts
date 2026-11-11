import find from 'lodash/find';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

import {
    MigratedSettingsDto,
    SettingsDto,
    SettingsMigrationDto,
    StoredSettingsDto,
} from '__types/app/settings';
import {
    DEFAULT_SETTINGS,
    DISCARDED_SETTINGS,
    FIRST_SETTINGS_VERSION,
    SETTINGS_MIGRATIONS,
    SETTINGS_VERSION,
} from '__utils/consts';

export const migrateSettings = (
    stored: unknown,
    migrations: SettingsMigrationDto[] = SETTINGS_MIGRATIONS,
    currentVersion: number = SETTINGS_VERSION,
): MigratedSettingsDto => {
    if (isNil(stored)) {
        return {settings: DEFAULT_SETTINGS, isDiscarded: false, isChanged: false};
    }

    if (!isPlainObject(stored)) {
        return DISCARDED_SETTINGS;
    }

    const storedSettings = stored as StoredSettingsDto;
    const storedVersion = storedSettings.settingsVersion ?? FIRST_SETTINGS_VERSION;

    if (!isNumber(storedVersion) || !Number.isInteger(storedVersion) || storedVersion < FIRST_SETTINGS_VERSION || storedVersion > currentVersion) {
        return DISCARDED_SETTINGS;
    }

    let settings = storedSettings;

    for (let version = storedVersion; version < currentVersion; version++) {
        const migration = find(migrations, {fromVersion: version});

        if (!migration) {
            return DISCARDED_SETTINGS;
        }

        settings = migration.migrate(settings);
    }

    return {
        settings: {...DEFAULT_SETTINGS, ...settings as Partial<SettingsDto>, settingsVersion: currentVersion},
        isDiscarded: false,
        isChanged: storedSettings.settingsVersion !== currentVersion,
    };
};
