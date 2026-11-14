import type {Nullable} from 'infrastructure/common';

import {LanguageEnum} from '../i18n/language';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '../stats/statKeys';

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
    lastNotifiedVersion: Nullable<string>;
    cardOrder: string[];
    hiddenOutputStats: OutputStatKeyEnum[];
    hiddenGeneralStats: GeneralStatKeyEnum[];
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
