import some from 'lodash/some.js';
import {spawnSync} from 'node:child_process';

import {CLOSE_WAIT_MS, OBS_PROCESS_NAME} from '../consts.ts';

import {findStandProcesses} from './findStandProcesses.ts';
import {waitFor} from './waitFor.ts';

export const stopStand = async ({isObsOnly = false} = {}) => {
    findStandProcesses()
        .filter(({name}) => name === OBS_PROCESS_NAME)
        .forEach(({id}) => spawnSync('taskkill', ['/PID', String(id)], {stdio: 'ignore'}));

    try {
        await waitFor('OBS to close', () => !some(findStandProcesses(), {name: OBS_PROCESS_NAME}), CLOSE_WAIT_MS);
    } catch {
        findStandProcesses()
            .filter(({name}) => name === OBS_PROCESS_NAME)
            .forEach(({id}) => spawnSync('taskkill', ['/PID', String(id), '/T', '/F'], {stdio: 'ignore'}));
    }

    if (isObsOnly) {
        return;
    }

    findStandProcesses().forEach(({id}) => spawnSync('taskkill', ['/PID', String(id), '/T', '/F'], {stdio: 'ignore'}));
    console.log('Stand is stopped');
};
