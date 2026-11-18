import type {Nullable} from 'infrastructure/common';

import {LanguageEnum} from '../i18n/language';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '../stats/statKeys';
import {ThemeModeEnum} from '../theme';

export type StoredSettingsDto = Record<string, unknown>;

export type CardPlatformDto = {
    platform: string;
    keyId: Nullable<string>;
};

export type CardPlatformChoiceDto = {
    cardKey: string;
    platform: string;
    keyId: Nullable<string>;
};

export type SettingsDto = {
    settingsVersion: number;
    port: number;
    isShowGeneralCard: boolean;
    isShowOutputCards: boolean;
    language: Nullable<LanguageEnum>;
    themeMode: ThemeModeEnum;
    isMockEnabled: boolean;
    isAutoUpdateEnabled: boolean;
    isJournalEnabled: boolean;
    lastUpdateCheckAt: Nullable<number>;
    lastNotifiedVersion: Nullable<string>;
    cardOrder: string[];
    cardPlatforms: Record<string, CardPlatformDto>;
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
