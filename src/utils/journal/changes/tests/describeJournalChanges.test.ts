import {
    describe,
    expect,
    it,
} from 'vitest';

import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {JournalLevelEnum} from '__types/journal';
import {HealthLevelEnum} from '__types/stats/views';
import {UpdateStageEnum} from '__types/update/bridgeUpdate';

import {describeJournalChanges} from '../describeJournalChanges';

import {OUTPUT, SNAPSHOT} from './consts';

const {Closed, Identified} = ConnectionStatusEnum;

const {Info, Warn, Error: ErrorLevel} = JournalLevelEnum;

describe('describeJournalChanges', () => {
    it('writes nothing when nothing changed', () => {
        const entries = describeJournalChanges(SNAPSHOT, {...SNAPSHOT});

        expect(entries).toEqual([]);
    });

    it('writes a lost connection with its close code', () => {
        const closed = {...SNAPSHOT, status: Closed, lastCloseCode: 1006};

        const entries = describeJournalChanges(SNAPSHOT, closed);

        expect(entries).toEqual([{
            level: Warn,
            source: 'obs',
            message: `connection ${Identified} -> ${Closed} code=1006`,
        }]);
    });

    it('writes when the bridge goes missing, but not when it comes back to missing state unchanged', () => {
        const missing = {...SNAPSHOT, isBridgeMissing: true, bridgeVersion: null};

        const missingLevels = describeJournalChanges(SNAPSHOT, missing).map(({level}) => level);

        const repeatedEntries = describeJournalChanges(missing, missing);

        expect(missingLevels).toEqual([Warn]);
        expect(repeatedEntries).toEqual([]);
    });

    it('writes a failed update as an error', () => {
        const failedUpdate = {
            ...SNAPSHOT,
            updateStage: UpdateStageEnum.Failed,
            updateVersion: '2.0.0',
            updateError: 'signature',
        };

        const [entry] = describeJournalChanges(SNAPSHOT, failedUpdate);

        expect(entry).toEqual({level: ErrorLevel, source: 'panel', message: 'update stage=failed version=2.0.0 error=signature'});
    });

    it('writes a rollback as a warning', () => {
        const rolledBack = {...SNAPSHOT, rolledBackVersion: '2.0.0'};

        const entries = describeJournalChanges(SNAPSHOT, rolledBack);

        expect(entries).toEqual([{
            level: Warn,
            source: 'panel',
            message: 'rolled back version=2.0.0',
        }]);
    });

    it('writes the health of an output with the dropped frames', () => {
        const unstable = {...OUTPUT, level: HealthLevelEnum.Warn, recentDropped: 40};

        const withUnstable = {...SNAPSHOT, outputs: [unstable]};

        const worsenedEntries = describeJournalChanges(SNAPSHOT, withUnstable);

        const recoveredLevels = describeJournalChanges(withUnstable, SNAPSHOT).map(({level}) => level);

        expect(worsenedEntries).toEqual([{
            level: Warn,
            source: 'Twitch',
            message: 'status ok -> warn dropped_1m=40',
        }]);

        expect(recoveredLevels).toEqual([Info]);
    });

    it('writes reconnecting and the end of a stream', () => {
        const reconnecting = {
            ...SNAPSHOT,
            outputs: [{...OUTPUT, isReconnecting: true}],
        };

        const stopped = {
            ...SNAPSHOT,
            outputs: [{...OUTPUT, isActive: false, level: HealthLevelEnum.Off}],
        };

        const [reconnectingEntry] = describeJournalChanges(SNAPSHOT, reconnecting);

        const [stoppedEntry] = describeJournalChanges(SNAPSHOT, stopped);

        expect(reconnectingEntry.message).toBe('reconnecting');
        expect(stoppedEntry.message).toBe('stream stopped');
    });

    it('writes the settings the user changed', () => {
        const withoutAutoUpdate = {...SNAPSHOT, isAutoUpdateEnabled: false};

        const entries = describeJournalChanges(SNAPSHOT, withoutAutoUpdate);

        expect(entries).toEqual([{
            level: Info,
            source: 'user',
            message: 'changed auto_update=false',
        }]);
    });
});
