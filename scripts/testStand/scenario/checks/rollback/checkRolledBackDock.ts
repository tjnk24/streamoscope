import {
    CONNECTION_WAIT_MS,
    DOCK_CONNECTED_TEXT,
    OPEN_SETTINGS_EXPRESSION,
} from '../../../consts.ts';
import {evaluateInDock} from '../../../dock/evaluateInDock.ts';
import {findDockTarget} from '../../../dock/findDockTarget.ts';
import {getDockText} from '../../../dock/getDockText.ts';
import {restartObs} from '../../../processes/restartObs.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import {checkStep} from '../checkStep.ts';

export const checkRolledBackDock = async (brokenVersion: string, healthyVersion: string) => {
    const hasRollbackText = async () => {
        await evaluateInDock(OPEN_SETTINGS_EXPRESSION);

        return (await getDockText()).includes(`Version ${brokenVersion} failed to start`);
    };

    await restartObs();
    await waitFor('the dock to connect', async () => (await getDockText()).includes(DOCK_CONNECTED_TEXT), CONNECTION_WAIT_MS);
    checkStep('the next launch opens the healthy version', (await findDockTarget())?.url.includes(`/versions/${healthyVersion}/`), true);

    await waitFor('the rollback text in the card', hasRollbackText, CONNECTION_WAIT_MS);
    console.log('ok   the settings card tells about the rollback');
};
