import fs from 'node:fs';

import {
    CONNECTION_WAIT_MS,
    JOURNAL_FORBIDDEN_TEXTS,
    JOURNAL_OBS_STATS_PATTERN,
    JOURNAL_PATH,
    JOURNAL_SILENCE_MS,
    JOURNAL_STATS_PATTERN,
} from '../../consts.ts';
import {readWebSocketConfig} from '../../obs/readWebSocketConfig.ts';
import {waitFor} from '../../processes/waitFor.ts';
import {readStandFile} from '../readStandFile.ts';

import {checkStep} from './checkStep.ts';
import {sendJournalParameter} from './sendJournalParameter.ts';

export const checkJournal = async () => {
    await waitFor('the stream stop in the journal', () => readStandFile(JOURNAL_PATH)?.includes('stream stopped') ?? false, CONNECTION_WAIT_MS);

    const journal = readStandFile(JOURNAL_PATH) ?? '';

    checkStep('the journal has the load of the bridge', journal.includes('loaded version='), true);
    checkStep('the journal has the start of the dock', journal.includes('started version='), true);
    checkStep('the journal has the versions of OBS', /obs=\d+\.\d+\.\d+ websocket=/.test(journal), true);
    checkStep('the journal has the OBS events from the bridge', /obs\s+stream started/.test(journal), true);
    checkStep('the journal has the stream statistics', JOURNAL_STATS_PATTERN.test(journal), true);
    checkStep('the journal has the OBS statistics', JOURNAL_OBS_STATS_PATTERN.test(journal), true);

    const {server_password: password} = readWebSocketConfig();

    [...JOURNAL_FORBIDDEN_TEXTS, password].forEach(text => {
        checkStep(`the journal has no "${text === password ? 'password' : text}"`, journal.includes(text), false);
    });

    await sendJournalParameter('JournalCommand', 'off');
    await waitFor('the journal to turn off', () => readStandFile(JOURNAL_PATH)?.includes('journal turned off') ?? false, CONNECTION_WAIT_MS);

    const sizeWhenOff = fs.statSync(JOURNAL_PATH).size;

    await sendJournalParameter('JournalLines', 'written while off');
    await new Promise(resolve => {
        setTimeout(resolve, JOURNAL_SILENCE_MS);
    });

    checkStep('the journal stays silent when turned off', fs.statSync(JOURNAL_PATH).size, sizeWhenOff);

    await sendJournalParameter('JournalCommand', 'on');
    await waitFor('the journal to turn on', () => readStandFile(JOURNAL_PATH)?.includes('journal turned on') ?? false, CONNECTION_WAIT_MS);
};
