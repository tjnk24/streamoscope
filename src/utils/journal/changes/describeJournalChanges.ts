import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {
    JournalEntryDto,
    JournalLevelEnum,
    JournalSnapshotDto,
} from '__types/journal';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';

import {describeOutputChanges} from './describeOutputChanges';

const {Info, Warn, Error} = JournalLevelEnum;

const {Closed, WrongPassword} = ConnectionStatusEnum;

const {Checking, Failed} = UpdateCheckStatusEnum;

export const describeJournalChanges = (previous: JournalSnapshotDto, current: JournalSnapshotDto) => {
    const entries: JournalEntryDto[] = [];

    if (previous.status !== current.status) {
        const isProblem = current.status === Closed || current.status === WrongPassword;
        const closeCode = current.status === Closed ? ` code=${current.lastCloseCode ?? 'none'}` : '';

        const statusEntry: JournalEntryDto = {
            level: isProblem ? Warn : Info,
            source: 'obs',
            message: `connection ${previous.status} -> ${current.status}${closeCode}`,
        };

        entries.push(statusEntry);
    }

    if (current.obsDescription && previous.obsDescription !== current.obsDescription) {
        const obsEntry: JournalEntryDto = {
            level: Info,
            source: 'obs',
            message: current.obsDescription,
        };

        entries.push(obsEntry);
    }

    if (previous.isSwitchingCollection !== current.isSwitchingCollection) {
        const collectionEntry: JournalEntryDto = {
            level: Info,
            source: 'obs',
            message: current.isSwitchingCollection ? 'scene collection switch started' : 'scene collection switch finished',
        };

        entries.push(collectionEntry);
    }

    if (current.bridgeVersion !== null && previous.bridgeVersion !== current.bridgeVersion) {
        const bridgeFoundEntry: JournalEntryDto = {
            level: Info,
            source: 'panel',
            message: `bridge found version=${current.bridgeVersion}`,
        };

        entries.push(bridgeFoundEntry);
    }

    if (previous.isBridgeMissing !== current.isBridgeMissing && current.isBridgeMissing) {
        const bridgeMissingEntry: JournalEntryDto = {
            level: Warn,
            source: 'panel',
            message: 'bridge missing in this scene collection',
        };

        entries.push(bridgeMissingEntry);
    }

    if (previous.checkStatus !== current.checkStatus && current.checkStatus !== Checking) {
        const checkEntry: JournalEntryDto = {
            level: current.checkStatus === Failed ? Warn : Info,
            source: 'panel',
            message: `update check ${current.checkStatus}`,
        };

        entries.push(checkEntry);
    }

    if (current.updateStage !== null && (previous.updateStage !== current.updateStage || previous.updateVersion !== current.updateVersion)) {
        const updateEntry: JournalEntryDto = {
            level: current.updateError ? Error : Info,
            source: 'panel',
            message: `update stage=${current.updateStage} version=${current.updateVersion ?? 'unknown'} error=${current.updateError ?? 'none'}`,
        };

        entries.push(updateEntry);
    }

    if (current.rolledBackVersion !== null && previous.rolledBackVersion !== current.rolledBackVersion) {
        const rollbackEntry: JournalEntryDto = {
            level: Warn,
            source: 'panel',
            message: `rolled back version=${current.rolledBackVersion}`,
        };

        entries.push(rollbackEntry);
    }

    if (previous.targetsDescription !== current.targetsDescription) {
        const targetsEntry: JournalEntryDto = {
            level: Info,
            source: 'panel',
            message: `outputs ${current.targetsDescription || 'none'}`,
        };

        entries.push(targetsEntry);
    }

    if (previous.port !== current.port) {
        const portEntry: JournalEntryDto = {
            level: Info,
            source: 'user',
            message: `changed port=${current.port}`,
        };

        entries.push(portEntry);
    }

    if (previous.language !== current.language) {
        const languageEntry: JournalEntryDto = {
            level: Info,
            source: 'user',
            message: `changed language=${current.language ?? 'auto'}`,
        };

        entries.push(languageEntry);
    }

    if (previous.isShowGeneralCard !== current.isShowGeneralCard) {
        const generalCardEntry: JournalEntryDto = {
            level: Info,
            source: 'user',
            message: `changed obs_card=${current.isShowGeneralCard}`,
        };

        entries.push(generalCardEntry);
    }

    if (previous.isAutoUpdateEnabled !== current.isAutoUpdateEnabled) {
        const autoUpdateEntry: JournalEntryDto = {
            level: Info,
            source: 'user',
            message: `changed auto_update=${current.isAutoUpdateEnabled}`,
        };

        entries.push(autoUpdateEntry);
    }

    return [...entries, ...describeOutputChanges(previous.outputs, current.outputs)];
};
