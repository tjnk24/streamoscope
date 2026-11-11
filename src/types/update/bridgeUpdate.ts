import type {Nullable} from 'infrastructure/common';

export enum UpdateStageEnum {
    Preparing = 'preparing',
    Downloading = 'downloading',
    Verifying = 'verifying',
    Installing = 'installing',
    Done = 'done',
    Failed = 'failed',
}

export enum UpdateErrorEnum {
    InvalidVersion = 'invalidVersion',
    NotNewer = 'notNewer',
    Busy = 'busy',
    Network = 'network',
    Signature = 'signature',
    Incompatible = 'incompatible',
    Install = 'install',
    Unexpected = 'unexpected',
}

export type UpdateStatusDto = {
    version: string;
    stage: UpdateStageEnum;
    percent: number;
    error: Nullable<string>;
    updated: number;
};

export type BridgeUpdateDto = {
    available: boolean;
    status: Nullable<string>;
    rolledBackVersion?: string;
    stubVersion?: number;
};

export type BridgeUpdateStateDto = {
    isAvailable: boolean;
    bridgeVersion: number;
    status: Nullable<UpdateStatusDto>;
    rolledBackVersion: Nullable<string>;
    stubVersion: Nullable<number>;
};
