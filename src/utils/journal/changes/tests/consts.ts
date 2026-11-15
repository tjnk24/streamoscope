import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {JournalOutputSnapshotDto, JournalSnapshotDto} from '__types/journal';
import {HealthLevelEnum} from '__types/stats/views';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';

export const OUTPUT: JournalOutputSnapshotDto = {
    label: 'Twitch',
    isActive: true,
    isReconnecting: false,
    level: HealthLevelEnum.Ok,
    recentDropped: 0,
};

export const SNAPSHOT: JournalSnapshotDto = {
    status: ConnectionStatusEnum.Identified,
    lastCloseCode: null,
    obsDescription: 'obs=33.0.1 websocket=5.6.2 platform=Windows 11',
    isSwitchingCollection: false,
    bridgeVersion: 5,
    isBridgeMissing: false,
    checkStatus: UpdateCheckStatusEnum.Idle,
    updateStage: null,
    updateVersion: null,
    updateError: null,
    rolledBackVersion: null,
    targetsDescription: 'Twitch(plugin)',
    outputs: [OUTPUT],
    port: 4455,
    language: null,
    isShowOutputCards: true,
    isShowGeneralCard: true,
    isAutoUpdateEnabled: true,
};
