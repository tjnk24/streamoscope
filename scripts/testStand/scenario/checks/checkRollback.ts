import find from 'lodash/find.js';

import {
    CONNECTION_WAIT_MS,
    DOCK_CONNECTED_TEXT,
    HEALTHY_PROCESS_PATH,
    OBS_PROCESS_NAME,
    OPEN_SETTINGS_EXPRESSION,
    ROLLBACK_WAIT_MS,
    ROLLED_BACK_VERSION_PATH,
    TRIAL_PATH,
    UPDATE_WAIT_MS,
} from '../../consts.ts';
import {evaluateInDock} from '../../dock/evaluateInDock.ts';
import {findDockTarget} from '../../dock/findDockTarget.ts';
import {getDockText} from '../../dock/getDockText.ts';
import {sendBridgeCommand} from '../../obs/sendBridgeCommand.ts';
import {findStandProcesses} from '../../processes/findStandProcesses.ts';
import {restartObs} from '../../processes/restartObs.ts';
import {waitFor} from '../../processes/waitFor.ts';
import {getCurrentVersion} from '../getCurrentVersion.ts';
import {readStandFile} from '../readStandFile.ts';

import {checkStep} from './checkStep.ts';

export const checkRollback = async (brokenVersion: string, healthyVersion: string) => {
    const obsProcess = find(findStandProcesses(), {name: OBS_PROCESS_NAME});

    await waitFor('the health report of this launch of OBS', () => readStandFile(HEALTHY_PROCESS_PATH) === String(obsProcess?.id), CONNECTION_WAIT_MS);
    await sendBridgeCommand(`install:${brokenVersion}`);
    await waitFor('the broken version to be staged', () => getCurrentVersion() === brokenVersion, UPDATE_WAIT_MS);
    checkStep('the broken version is on trial', readStandFile(TRIAL_PATH) !== null, true);

    const startedAt = Date.now();

    await restartObs();
    await waitFor('the rollback', () => getCurrentVersion() === healthyVersion, ROLLBACK_WAIT_MS);
    console.log(`ok   the bridge rolls back ${Math.round((Date.now() - startedAt) / 1000)} s after the restart began`);

    checkStep('the mark names the broken version', readStandFile(ROLLED_BACK_VERSION_PATH), brokenVersion);
    checkStep('the trial is over', readStandFile(TRIAL_PATH), null);

    await restartObs();
    await waitFor('the dock to connect', async () => (await getDockText()).includes(DOCK_CONNECTED_TEXT), CONNECTION_WAIT_MS);
    checkStep('the next launch opens the healthy version', (await findDockTarget())?.url.includes(`/versions/${healthyVersion}/`), true);

    await waitFor('the rollback text in the card', async () => {
        await evaluateInDock(OPEN_SETTINGS_EXPRESSION);

        return (await getDockText()).includes(`Version ${brokenVersion} failed to start`);
    }, CONNECTION_WAIT_MS);
    console.log('ok   the settings card tells about the rollback');
};
