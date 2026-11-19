import fs from 'node:fs';
import path from 'node:path';

import {
    MULTI_RTMP_ARCHIVE,
    MULTI_RTMP_BINARY_DIRECTORY,
    MULTI_RTMP_DATA_DIRECTORY,
    MULTI_RTMP_PLUGIN_LIBRARY,
    MULTI_RTMP_VERSION,
    OBS_DIRECTORY,
} from '../consts.ts';
import {downloadArchive} from '../setup/downloadArchive.ts';
import {unpackArchive} from '../setup/unpackArchive.ts';

export const installMultiRtmpPlugin = async (isFake: boolean) => {
    fs.rmSync(MULTI_RTMP_BINARY_DIRECTORY, {recursive: true, force: true});
    fs.rmSync(MULTI_RTMP_DATA_DIRECTORY, {recursive: true, force: true});

    if (isFake) {
        console.log('obs-multi-rtmp is not downloaded on request: the stand checks with its imitation fake-multi-rtmp.lua');

        return false;
    }

    try {
        unpackArchive(await downloadArchive(MULTI_RTMP_ARCHIVE), OBS_DIRECTORY);

        if (!fs.existsSync(MULTI_RTMP_PLUGIN_LIBRARY)) {
            throw new Error(`${path.basename(MULTI_RTMP_PLUGIN_LIBRARY)} is not in ${MULTI_RTMP_ARCHIVE.name}`);
        }
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);

        fs.rmSync(MULTI_RTMP_BINARY_DIRECTORY, {recursive: true, force: true});
        fs.rmSync(MULTI_RTMP_DATA_DIRECTORY, {recursive: true, force: true});
        console.log(`WARNING obs-multi-rtmp ${MULTI_RTMP_VERSION} is not installed (${reason}): the stand checks with its imitation fake-multi-rtmp.lua`);

        return false;
    }

    console.log(`obs-multi-rtmp ${MULTI_RTMP_VERSION} from GitHub is installed into the stand OBS`);

    return true;
};
