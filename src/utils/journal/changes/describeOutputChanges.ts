import {
    JournalEntryDto,
    JournalLevelEnum,
    JournalOutputSnapshotDto,
} from '__types/journal';
import {HealthLevelEnum} from '__types/stats/views';

const {Info, Warn} = JournalLevelEnum;

const {Ok, Off} = HealthLevelEnum;

export const describeOutputChanges = (previousOutputs: JournalOutputSnapshotDto[], currentOutputs: JournalOutputSnapshotDto[]) => {
    const entries: JournalEntryDto[] = [];

    currentOutputs.forEach(current => {
        const previous = previousOutputs.find(({label}) => label === current.label);
        const {label: source} = current;

        if (!previous) {
            return;
        }

        if (previous.isActive !== current.isActive) {
            const activityEntry: JournalEntryDto = {
                level: Info,
                source,
                message: current.isActive ? 'stream started' : 'stream stopped',
            };

            entries.push(activityEntry);
        }

        if (previous.isReconnecting !== current.isReconnecting) {
            const reconnectEntry: JournalEntryDto = {
                level: current.isReconnecting ? Warn : Info,
                source,
                message: current.isReconnecting ? 'reconnecting' : 'reconnected',
            };

            entries.push(reconnectEntry);
        }

        if (previous.level !== current.level && previous.level !== Off && current.level !== Off) {
            const levelEntry: JournalEntryDto = {
                level: current.level === Ok ? Info : Warn,
                source,
                message: `status ${previous.level} -> ${current.level} dropped_1m=${current.recentDropped}`,
            };

            entries.push(levelEntry);
        }
    });

    return entries;
};
