import fs from 'node:fs';

import {
    BACKGROUND_UPDATE_WAIT_MS,
    CONNECTION_WAIT_MS,
    HEALTHY_LOADER_PATH,
    HEALTHY_VERSION_PATH,
    ROLLBACK_WAIT_MS,
    ROLLED_BACK_VERSION_PATH,
    TRIAL_PATH,
    UPDATE_CHECK_STAMP_PATH,
} from '../../../consts.ts';
import {findDockTarget} from '../../../dock/findDockTarget.ts';
import {restartObs} from '../../../processes/restartObs.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import {getCurrentVersion} from '../../getCurrentVersion.ts';
import {readStandFile} from '../../readStandFile.ts';
import {checkStep} from '../checkStep.ts';

import {checkRolledBackDock} from './checkRolledBackDock.ts';

export const checkBrokenLoader = async (brokenVersion: string, healthyVersion: string) => {
    const isTrialOver = () => readStandFile(HEALTHY_VERSION_PATH) === brokenVersion && readStandFile(TRIAL_PATH) === null;

    fs.rmSync(UPDATE_CHECK_STAMP_PATH, {force: true});

    await restartObs();
    await waitFor('the background update', () => getCurrentVersion() === brokenVersion, BACKGROUND_UPDATE_WAIT_MS);
    checkStep('the version with the broken loader is on trial', readStandFile(TRIAL_PATH) !== null, true);

    await restartObs();
    await waitFor('the end of the trial', isTrialOver, CONNECTION_WAIT_MS);
    checkStep('the loader of the previous version judged the trial', readStandFile(HEALTHY_LOADER_PATH), healthyVersion);
    checkStep('the trial opened the dock of the new version', (await findDockTarget())?.url.includes(`/versions/${brokenVersion}/`), true);

    const startedAt = Date.now();

    await restartObs();
    await waitFor('the rollback', () => getCurrentVersion() === healthyVersion, ROLLBACK_WAIT_MS);
    console.log(`ok   the stub rolls back ${Math.round((Date.now() - startedAt) / 1000)} s after the restart began`);

    checkStep('the mark names the version with the broken loader', readStandFile(ROLLED_BACK_VERSION_PATH), brokenVersion);
    checkStep('the stub runs the loader of the healthy version', readStandFile(HEALTHY_LOADER_PATH), healthyVersion);

    await checkRolledBackDock(brokenVersion, healthyVersion);
};
