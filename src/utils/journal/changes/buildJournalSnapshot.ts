import {BaseStore} from '__reducers';
import {connectionSelector} from '__selectors/connectionSelectors';
import {settingsSelector} from '__selectors/settingsSelectors';
import {statsSelector} from '__selectors/statsSelectors';
import {updateSelector} from '__selectors/updateSelectors';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {JournalSnapshotDto} from '__types/journal';
import {HealthLevelEnum} from '__types/stats/views';
import {PlatformSourceEnum} from '__types/targets';
import {BRIDGE_MISSING_CHECKS} from '__utils/consts';
import {resolveTargetPlatform} from '__utils/targets/resolveTargetPlatform';

import {getJournalTargetLabel} from '../getJournalTargetLabel';

export const buildJournalSnapshot = (state: BaseStore): JournalSnapshotDto => {
    const {status, lastCloseCode, obsVersion, isSwitchingCollection} = connectionSelector(state);

    const {targets, view} = statsSelector(state);
    const {bridge, bridgeMissingChecks, checkStatus} = updateSelector(state);

    const {
        port,
        language,
        isShowOutputCards,
        isShowGeneralCard,
        isAutoUpdateEnabled,
        cardPlatforms,
    } = settingsSelector(state);

    return {
        status,
        lastCloseCode,
        obsDescription: obsVersion && `obs=${obsVersion.obsVersion} websocket=${obsVersion.obsWebSocketVersion} platform=${obsVersion.platformDescription}`,
        isSwitchingCollection,
        bridgeVersion: bridge?.bridgeVersion ?? null,
        isBridgeMissing: status === ConnectionStatusEnum.Identified && bridgeMissingChecks >= BRIDGE_MISSING_CHECKS,
        checkStatus,
        updateStage: bridge?.status?.stage ?? null,
        updateVersion: bridge?.status?.version ?? null,
        updateError: bridge?.status?.error ?? null,
        rolledBackVersion: bridge?.rolledBackVersion ?? null,
        targetsDescription: targets.map(target => `${getJournalTargetLabel(target)}(${target.outputName ?? target.origin})`).join(', '),
        outputs: targets.map(target => {
            const output = view.outputs[target.key];
            const {selected, source} = resolveTargetPlatform(target, cardPlatforms);

            return {
                label: getJournalTargetLabel(target),
                isActive: output?.isActive ?? false,
                isReconnecting: output?.isReconnecting ?? false,
                level: output?.level ?? HealthLevelEnum.Off,
                recentDropped: output?.recentDropped ?? 0,
                chosenPlatform: source === PlatformSourceEnum.User ? selected : null,
            };
        }),
        port,
        language,
        isShowOutputCards,
        isShowGeneralCard,
        isAutoUpdateEnabled,
    };
};
