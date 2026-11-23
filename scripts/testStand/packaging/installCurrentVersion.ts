import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {ensureMinisign} from '../../buildInstaller/ensureMinisign.ts';
import type {InstallLayoutDto} from '../../packagePortable/InstallLayoutDto.ts';
import {writeInstallLayout} from '../../packagePortable/writeInstallLayout.ts';
import {VERSION} from '../../packageRelease/consts.ts';
import {
    DATA_DIRECTORY,
    INSTALL_DIRECTORY,
    LOCAL_APP_DATA_DIRECTORY,
    OBS_DIRECTORY,
    POWERSHELL_ARGUMENTS,
    PROJECT_COPY_DIRECTORY,
} from '../consts.ts';

import {copyProject} from './copyProject.ts';
import {packageTestRelease} from './packageTestRelease.ts';
import {removeProjectCopy} from './removeProjectCopy.ts';

export const installCurrentVersion = async () => {
    copyProject(VERSION);

    const standLayout: InstallLayoutDto = {
        packageDirectory: packageTestRelease(PROJECT_COPY_DIRECTORY, VERSION),
        installDirectory: INSTALL_DIRECTORY,
        version: VERSION,
        minisignPath: await ensureMinisign(),
    };

    fs.rmSync(LOCAL_APP_DATA_DIRECTORY, {recursive: true, force: true});
    fs.mkdirSync(DATA_DIRECTORY, {recursive: true});
    writeInstallLayout(standLayout);
    removeProjectCopy();

    const configuration = spawnSync('powershell.exe', [
        ...POWERSHELL_ARGUMENTS,
        '-File',
        path.join(INSTALL_DIRECTORY, 'versions', VERSION, 'configure-obs.ps1'),
        '-Mode',
        'Install',
        '-InstallDirectory',
        INSTALL_DIRECTORY,
        '-ObsDirectory',
        OBS_DIRECTORY,
        '-DataDirectory',
        DATA_DIRECTORY,
    ], {stdio: 'inherit'});

    if (configuration.status !== 0) {
        throw new Error(`configure-obs.ps1 finished with exit code ${configuration.status}, see ${path.join(DATA_DIRECTORY, 'configure-obs.log')}`);
    }

    console.log(`Installed ${VERSION} into ${INSTALL_DIRECTORY}`);
};
