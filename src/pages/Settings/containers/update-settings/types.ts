import type {ParseKeys} from 'i18next';
import type {Nullable} from 'infrastructure/common';

export type UpdateProgressDto = {
    statusKey: Nullable<ParseKeys>;
    errorKey: Nullable<ParseKeys>;
    isRunning: boolean;
    isStaged: boolean;
    version: Nullable<string>;
    percent: number;
};

export type UpdateNotesDto = {
    isManual: boolean;
    notes: string[];
};

export type UpdateSettingsViewDto = {
    lastCheckText: string;
    checkText: Nullable<string>;
    isCheckFailed: boolean;
    statusText: Nullable<string>;
    isStatusRunning: boolean;
    errorText: Nullable<string>;
    notes: string[];
    isUpdateShown: boolean;
    isManual: boolean;
    updateText: string;
    currentReleaseUrl: string;
    latestReleaseUrl: Nullable<string>;
    isAutoUpdateEnabled: boolean;
    isInstallerNeeded: boolean;
    installerUrl: string;
};
