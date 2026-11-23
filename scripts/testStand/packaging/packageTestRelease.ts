import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {stageTestUpdater} from '../../buildInstaller/stageTestUpdater.ts';
import {TEST_RELEASE_HOST, TEST_RELEASE_PORT} from '../../serveTestRelease/consts.ts';
import {
    REGISTRY_KEY_PATTERN,
    STAND_REGISTRY_KEY_LINE,
    TEST_BUILDS_CACHE_DIRECTORY,
    TEST_PUBLIC_KEY_PATH,
} from '../consts.ts';

export const packageTestRelease = (projectDirectory: string, version: string) => {
    const server = `http://${TEST_RELEASE_HOST}:${TEST_RELEASE_PORT}`;
    const [, publicKey] = fs.readFileSync(TEST_PUBLIC_KEY_PATH, 'utf8').split(/\r?\n/);
    const packaging = spawnSync('npm run package:release', {
        cwd: projectDirectory,
        env: {
            ...process.env,
            TEST_UPDATE_SERVER: server,
            TEST_UPDATE_PUBLIC_KEY: publicKey,
            RSPACK_CACHE_DIRECTORY: TEST_BUILDS_CACHE_DIRECTORY,
        },
        shell: true,
        stdio: ['ignore', 'ignore', 'inherit'],
    });

    if (packaging.status !== 0) {
        throw new Error(`npm run package:release failed in ${projectDirectory}`);
    }

    const packageDirectory = path.join(projectDirectory, 'release', `streamoscope-${version}`);
    const updaterDirectory = path.join(packageDirectory, 'updater');
    const constsPath = path.join(updaterDirectory, 'UpdateWidget', 'consts.ps1');
    const consts = fs.readFileSync(constsPath, 'utf8');

    if (!REGISTRY_KEY_PATTERN.test(consts)) {
        throw new Error(`${constsPath} no longer has the registry key the stand replaces`);
    }

    stageTestUpdater(server, publicKey, path.join(updaterDirectory, 'Update-Widget.ps1'));
    fs.writeFileSync(constsPath, consts.replace(REGISTRY_KEY_PATTERN, () => STAND_REGISTRY_KEY_LINE));

    return packageDirectory;
};
