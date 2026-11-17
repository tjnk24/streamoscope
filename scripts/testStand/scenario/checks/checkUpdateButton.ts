import {
    CONNECTION_WAIT_MS,
    HEALTHY_VERSION_PATH,
    OPEN_SETTINGS_EXPRESSION,
    OPEN_UPDATES_GROUP_EXPRESSION,
    ROLLED_BACK_VERSION_PATH,
    SLOW_DOCK_DELAY_MS,
    TRIAL_PATH,
    UPDATE_WAIT_MS,
} from '../../consts.ts';
import {clickDockButton} from '../../dock/clickDockButton.ts';
import {evaluateInDock} from '../../dock/evaluateInDock.ts';
import {findDockTarget} from '../../dock/findDockTarget.ts';
import {getDockText} from '../../dock/getDockText.ts';
import {setDockLoaderDelay} from '../../packaging/setDockLoaderDelay.ts';
import {restartObs} from '../../processes/restartObs.ts';
import {waitFor} from '../../processes/waitFor.ts';
import {getCurrentVersion} from '../getCurrentVersion.ts';
import {readStandFile} from '../readStandFile.ts';

import {checkStep} from './checkStep.ts';

export const checkUpdateButton = async (version: string) => {
    await waitFor('the updates group', async () => {
        await evaluateInDock(OPEN_SETTINGS_EXPRESSION);

        return (await getDockText()).includes('Updates');
    }, CONNECTION_WAIT_MS);
    await evaluateInDock(OPEN_UPDATES_GROUP_EXPRESSION);
    await waitFor('the button to check for updates', async () => (await getDockText()).includes('Check for updates'), CONNECTION_WAIT_MS);
    await clickDockButton('Check for updates');
    await waitFor(`version ${version} in the card`, async () => (await getDockText()).includes(version), CONNECTION_WAIT_MS);
    console.log(`ok   the card finds version ${version}`);

    await clickDockButton('Update');
    await waitFor('the staged update', () => getCurrentVersion() === version, UPDATE_WAIT_MS);
    console.log('ok   the Update button downloads, verifies and switches the version');

    await waitFor('the text about the next launch', async () => (await getDockText()).includes(`Version ${version} is downloaded`), CONNECTION_WAIT_MS);
    checkStep('the running dock stays on its version', (await findDockTarget())?.url.includes(`/versions/${version}/`), false);
    checkStep('the new version is on trial', readStandFile(TRIAL_PATH) !== null, true);

    setDockLoaderDelay(SLOW_DOCK_DELAY_MS);
    await restartObs();
    await waitFor('the health report of the new version', () => readStandFile(HEALTHY_VERSION_PATH) === version, CONNECTION_WAIT_MS);
    checkStep(`after a restart a dock opening ${SLOW_DOCK_DELAY_MS / 1000} s late opens the new version`, (await findDockTarget())?.url.includes(`/versions/${version}/`), true);
    await waitFor('the end of the trial', () => readStandFile(TRIAL_PATH) === null, CONNECTION_WAIT_MS);
    console.log('ok   a healthy dock ends the trial');
    checkStep('a late dock causes no rollback', readStandFile(ROLLED_BACK_VERSION_PATH), null);
    setDockLoaderDelay(0);
};
