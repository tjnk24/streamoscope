import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {ensureMinisign} from '../../buildInstaller/ensureMinisign.ts';
import {INSTALLER_DIRECTORY, VERSION} from '../../packageRelease/consts.ts';
import {
    CURRENT_VERSION_PATH,
    CURRENT_VERSION_TEMPLATE,
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

    const packageDirectory = packageTestRelease(PROJECT_COPY_DIRECTORY, VERSION);
    const versionDirectory = path.join(INSTALL_DIRECTORY, 'versions', VERSION);

    fs.rmSync(LOCAL_APP_DATA_DIRECTORY, {recursive: true, force: true});
    fs.mkdirSync(path.join(INSTALL_DIRECTORY, 'dock'), {recursive: true});
    fs.mkdirSync(path.join(INSTALL_DIRECTORY, 'updater'), {recursive: true});
    fs.mkdirSync(DATA_DIRECTORY, {recursive: true});

    fs.cpSync(packageDirectory, versionDirectory, {recursive: true});
    fs.rmSync(path.join(versionDirectory, 'README.txt'));
    removeProjectCopy();
    fs.copyFileSync(path.join(INSTALLER_DIRECTORY, 'loader', 'streamoscope-bridge.lua'), path.join(INSTALL_DIRECTORY, 'streamoscope-bridge.lua'));
    fs.copyFileSync(path.join(INSTALLER_DIRECTORY, 'loader', 'index.html'), path.join(INSTALL_DIRECTORY, 'dock', 'index.html'));
    fs.copyFileSync(path.join(INSTALLER_DIRECTORY, 'configure-obs.ps1'), path.join(INSTALL_DIRECTORY, 'configure-obs.ps1'));
    fs.cpSync(path.join(INSTALLER_DIRECTORY, 'ConfigureObs'), path.join(INSTALL_DIRECTORY, 'ConfigureObs'), {recursive: true});
    fs.copyFileSync(await ensureMinisign(), path.join(INSTALL_DIRECTORY, 'updater', 'minisign.exe'));
    fs.writeFileSync(CURRENT_VERSION_PATH, CURRENT_VERSION_TEMPLATE.replace('{version}', VERSION));

    const configuration = spawnSync('powershell.exe', [
        ...POWERSHELL_ARGUMENTS,
        '-File',
        path.join(versionDirectory, 'configure-obs.ps1'),
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
