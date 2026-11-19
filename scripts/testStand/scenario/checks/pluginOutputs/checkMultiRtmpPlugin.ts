import sortBy from 'lodash/sortBy.js';
import fs from 'node:fs';
import path from 'node:path';

import {
    CONNECTION_WAIT_MS,
    MULTI_RTMP_CONFIG,
    MULTI_RTMP_CONFIG_LOADED_PATTERN,
    MULTI_RTMP_LOADED_TEXT,
    MULTI_RTMP_VERSION,
    OBS_LOGS_DIRECTORY,
} from '../../../consts.ts';
import {waitFor} from '../../../processes/waitFor.ts';
import {checkStep} from '../checkStep.ts';

export const checkMultiRtmpPlugin = async () => {
    const logPaths = fs.readdirSync(OBS_LOGS_DIRECTORY).map(name => path.join(OBS_LOGS_DIRECTORY, name));
    const latestLogPath = sortBy(logPaths, logPath => fs.statSync(logPath).mtimeMs).at(-1) ?? '';

    const configLoaded = await waitFor('obs-multi-rtmp to read obs-multi-rtmp.json', () => (
        MULTI_RTMP_CONFIG_LOADED_PATTERN.exec(fs.readFileSync(latestLogPath, 'utf8'))
    ), CONNECTION_WAIT_MS);

    const [, targetCount, videoConfigCount] = configLoaded ?? [];

    checkStep(`OBS loads obs-multi-rtmp ${MULTI_RTMP_VERSION}`, fs.readFileSync(latestLogPath, 'utf8').includes(MULTI_RTMP_LOADED_TEXT), true);
    checkStep('obs-multi-rtmp reads each target of the stand', Number(targetCount), MULTI_RTMP_CONFIG.targets.length);
    checkStep('obs-multi-rtmp reads each video config of the stand', Number(videoConfigCount), MULTI_RTMP_CONFIG.video_configs.length);
};
