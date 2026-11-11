import {BaseStore} from '__reducers';
import {
    BridgeUpdateStateDto,
    UpdateStageEnum,
    UpdateStatusDto,
} from '__types/update/bridgeUpdate';
import {ReleaseDto} from '__types/update/release';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';

export const NOW = 1_800_000_000_000;

export const CURRENT_VERSION = '0.1.0';

export const RELEASE: ReleaseDto = {
    version: '0.2.0',
    url: 'https://github.com/tjnk24/streamoscope/releases/tag/v0.2.0',
    notes: '',
    publishedAt: null,
    compatibility: null,
};

export const RUNNING_STATUS: UpdateStatusDto = {
    version: '0.2.0',
    stage: UpdateStageEnum.Downloading,
    percent: 42,
    error: null,
    updated: NOW / 1000,
};

export const BRIDGE: BridgeUpdateStateDto = {
    isAvailable: true,
    bridgeVersion: 4,
    status: null,
    rolledBackVersion: null,
};

export const STATE = {
    update: {
        checkStatus: UpdateCheckStatusEnum.Available,
        latest: RELEASE,
        bridge: null,
        request: null,
    },
    settings: {
        lastUpdateCheckAt: NOW - 60_000,
        isAutoUpdateEnabled: true,
    },
} as unknown as BaseStore;
