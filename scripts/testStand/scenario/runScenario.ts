import fs from 'node:fs';

import {VERSION} from '../../packageRelease/consts.ts';
import {
    MULTI_RTMP_PLUGIN_LIBRARY,
    MULTI_RTMP_VERSION,
    SCENARIO_VERSIONS,
} from '../consts.ts';
import {buildNewerRelease} from '../packaging/buildNewerRelease.ts';
import {installCurrentVersion} from '../packaging/installCurrentVersion.ts';
import {restartAll} from '../processes/restartAll.ts';
import {startStand} from '../processes/startStand.ts';
import {stopStand} from '../processes/stopStand.ts';
import {setupStand} from '../setup/setupStand.ts';

import {checkBackgroundUpdate} from './checks/checkBackgroundUpdate.ts';
import {checkDockAndStream} from './checks/checkDockAndStream.ts';
import {checkJournal} from './checks/checkJournal.ts';
import {checkUpdateButton} from './checks/checkUpdateButton.ts';
import {checkMultiRtmpPlugin} from './checks/pluginOutputs/checkMultiRtmpPlugin.ts';
import {checkPluginOutputs} from './checks/pluginOutputs/checkPluginOutputs.ts';
import {checkWaitingTargets} from './checks/pluginOutputs/checkWaitingTargets.ts';
import {checkBrokenLoader} from './checks/rollback/checkBrokenLoader.ts';
import {checkRollback} from './checks/rollback/checkRollback.ts';

export const runScenario = async (isFakeMultiRtmp: boolean) => {
    const {button, broken, background, brokenLoader} = SCENARIO_VERSIONS;

    await stopStand();

    try {
        await setupStand(isFakeMultiRtmp);
        await installCurrentVersion();

        console.log(`--- the installed version ${VERSION} in OBS`);
        await startStand();

        if (fs.existsSync(MULTI_RTMP_PLUGIN_LIBRARY)) {
            console.log(`--- obs-multi-rtmp ${MULTI_RTMP_VERSION} from GitHub`);
            await checkMultiRtmpPlugin();
        } else {
            console.log('--- WARNING the stand checks with the imitation of obs-multi-rtmp, fake-multi-rtmp.lua');
        }

        console.log('--- obs-multi-rtmp targets before the first stream');
        await checkWaitingTargets();

        await checkDockAndStream();

        console.log('--- the journal');
        await checkJournal();

        console.log('--- plugin outputs named multi-output');
        await checkPluginOutputs();

        console.log(`--- the Update button, version ${button}`);
        await buildNewerRelease(button);
        await restartAll();
        await checkUpdateButton(button);

        console.log(`--- a broken dock, version ${broken}`);
        await buildNewerRelease(broken, 'dock');
        await restartAll();
        await checkRollback(broken, button);

        console.log(`--- the background update, version ${background}`);
        await buildNewerRelease(background);
        await restartAll();
        await checkBackgroundUpdate(background);

        console.log(`--- a broken bridge loader, version ${brokenLoader}`);
        await buildNewerRelease(brokenLoader, 'loader');
        await restartAll();
        await checkBrokenLoader(brokenLoader, background);

        console.log(fs.existsSync(MULTI_RTMP_PLUGIN_LIBRARY) ? 'ALL PASSED' : 'ALL PASSED with the imitation of obs-multi-rtmp');
    } finally {
        await stopStand();
    }
};
