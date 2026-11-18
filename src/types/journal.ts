import type {Nullable} from 'infrastructure/common';

import {ConnectionStatusEnum} from './connection/ConnectionStatusEnum';
import {LanguageEnum} from './i18n/language';
import {HealthLevelEnum} from './stats/views';
import {ThemeModeEnum} from './theme';
import {UpdateStageEnum} from './update/bridgeUpdate';
import {UpdateCheckStatusEnum} from './update/UpdateCheckStatusEnum';

export enum JournalLevelEnum {
    Info = 'INFO',
    Warn = 'WARN',
    Error = 'ERROR',
}

export type JournalTransportDto = {
    isReady: () => boolean;
    send: (lines: string[]) => void;
    setEnabled: (isEnabled: boolean) => void;
    openFolder: () => void;
};

export type JournalEntryDto = {
    level: JournalLevelEnum;
    source: string;
    message: string;
};

export type JournalOutputSnapshotDto = {
    label: string;
    isActive: boolean;
    isReconnecting: boolean;
    level: HealthLevelEnum;
    recentDropped: number;
    chosenPlatform: Nullable<string>;
};

export type JournalSnapshotDto = {
    status: ConnectionStatusEnum;
    lastCloseCode: Nullable<number>;
    obsDescription: Nullable<string>;
    isSwitchingCollection: boolean;
    bridgeVersion: Nullable<number>;
    isBridgeMissing: boolean;
    checkStatus: UpdateCheckStatusEnum;
    updateStage: Nullable<UpdateStageEnum>;
    updateVersion: Nullable<string>;
    updateError: Nullable<string>;
    rolledBackVersion: Nullable<string>;
    targetsDescription: string;
    outputs: JournalOutputSnapshotDto[];
    port: number;
    language: Nullable<LanguageEnum>;
    themeMode: ThemeModeEnum;
    isShowOutputCards: boolean;
    isShowGeneralCard: boolean;
    isAutoUpdateEnabled: boolean;
};
