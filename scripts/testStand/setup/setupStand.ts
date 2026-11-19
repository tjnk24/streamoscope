import fs from 'node:fs';

import {
    MEDIAMTX_ARCHIVE,
    MEDIAMTX_CONFIG,
    MEDIAMTX_CONFIG_PATH,
    MEDIAMTX_DIRECTORY,
    MEDIAMTX_EXECUTABLE,
    OBS_ARCHIVE,
    OBS_CONFIG_DIRECTORY,
    OBS_DIRECTORY,
    OBS_EXECUTABLE,
} from '../consts.ts';
import {installMultiRtmpPlugin} from '../multiRtmp/installMultiRtmpPlugin.ts';

import {downloadArchive} from './downloadArchive.ts';
import {ensureTestKey} from './ensureTestKey.ts';
import {runObsOnce} from './runObsOnce.ts';
import {unpackArchive} from './unpackArchive.ts';
import {writeObsConfig} from './writeObsConfig.ts';

export const setupStand = async (isFakeMultiRtmp = false) => {
    if (!fs.existsSync(OBS_EXECUTABLE)) {
        unpackArchive(await downloadArchive(OBS_ARCHIVE), OBS_DIRECTORY);
    }

    if (!fs.existsSync(MEDIAMTX_EXECUTABLE)) {
        unpackArchive(await downloadArchive(MEDIAMTX_ARCHIVE), MEDIAMTX_DIRECTORY);
    }

    const isPluginInstalled = await installMultiRtmpPlugin(isFakeMultiRtmp);

    fs.writeFileSync(MEDIAMTX_CONFIG_PATH, MEDIAMTX_CONFIG);
    fs.rmSync(OBS_CONFIG_DIRECTORY, {recursive: true, force: true});
    writeObsConfig(isPluginInstalled);
    await runObsOnce();

    await ensureTestKey();

    console.log(`Stand is ready: ${OBS_DIRECTORY}`);
};
