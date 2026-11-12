import type {Nullable} from 'infrastructure/common';

import {LanguageEnum} from '../i18n/language';

export type StoredSettingsDto = Record<string, unknown>;

export type SettingsDto = {
    settingsVersion: number;
    port: number;
    isShowGeneralCard: boolean;
    hasSeenGeneralCardNotice: boolean;
    language: Nullable<LanguageEnum>;
    isMockEnabled: boolean;
    isAutoUpdateEnabled: boolean;
    isJournalEnabled: boolean;
    lastUpdateCheckAt: Nullable<number>;
    cardOrder: string[];
};

export type MigratedSettingsDto = {
    settings: SettingsDto;
    isDiscarded: boolean;
    isChanged: boolean;
};

export type SettingsMigrationDto = {
    fromVersion: number;
    migrate: (settings: StoredSettingsDto) => StoredSettingsDto;
};
