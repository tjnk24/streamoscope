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

export const describeJournalChanges = (previous: JournalSnapshotDto, current: JournalSnapshotDto) => {
    const entries: JournalEntryDto[] = [];

    if (previous.status !== current.status) {
        const isProblem = current.status === Closed || current.status === WrongPassword;
        const closeCode = current.status === Closed ? ` code=${current.lastCloseCode ?? 'none'}` : '';

        entries.push({level: isProblem ? Warn : Info, source: 'obs', message: `connection ${previous.status} -> ${current.status}${closeCode}`});
    }

    if (current.obsDescription && previous.obsDescription !== current.obsDescription) {
        entries.push({level: Info, source: 'obs', message: current.obsDescription});
    }

    if (previous.isSwitchingCollection !== current.isSwitchingCollection) {
        entries.push({level: Info, source: 'obs', message: current.isSwitchingCollection ? 'scene collection switch started' : 'scene collection switch finished'});
    }

    if (current.bridgeVersion !== null && previous.bridgeVersion !== current.bridgeVersion) {
        entries.push({level: Info, source: 'panel', message: `bridge found version=${current.bridgeVersion}`});
    }

    if (previous.isBridgeMissing !== current.isBridgeMissing && current.isBridgeMissing) {
        entries.push({level: Warn, source: 'panel', message: 'bridge missing in this scene collection'});
    }

    if (previous.checkStatus !== current.checkStatus && current.checkStatus !== UpdateCheckStatusEnum.Checking) {
        const checkEntry: JournalEntryDto = {
            level: current.checkStatus === UpdateCheckStatusEnum.Failed ? Warn : Info,
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
        entries.push({level: Warn, source: 'panel', message: `rolled back version=${current.rolledBackVersion}`});
    }

    if (previous.targetsDescription !== current.targetsDescription) {
        entries.push({level: Info, source: 'panel', message: `outputs ${current.targetsDescription || 'none'}`});
    }

    if (previous.port !== current.port) {
        entries.push({level: Info, source: 'user', message: `changed port=${current.port}`});
    }

    if (previous.language !== current.language) {
        entries.push({level: Info, source: 'user', message: `changed language=${current.language ?? 'auto'}`});
    }

    if (previous.isShowGeneralCard !== current.isShowGeneralCard) {
        entries.push({level: Info, source: 'user', message: `changed obs_card=${current.isShowGeneralCard}`});
    }

    if (previous.isAutoUpdateEnabled !== current.isAutoUpdateEnabled) {
        entries.push({level: Info, source: 'user', message: `changed auto_update=${current.isAutoUpdateEnabled}`});
    }

    return [...entries, ...describeOutputChanges(previous.outputs, current.outputs)];
};
