import fs from 'node:fs';
import path from 'node:path';

import {
    BRIDGE_SOURCE_DIRECTORY,
    BRIDGE_TESTS_DIRECTORY,
    FONT_LICENSE_SOURCE,
    FONT_LICENSE_TARGET,
    INSTALLER_DIRECTORY,
    PACKAGE_DIRECTORY,
    RELEASE_DIRECTORY,
    ROOT_DIRECTORY,
    UPDATER_SOURCE_DIRECTORY,
    UPDATER_TARGET_DIRECTORY,
} from './consts.ts';

export const copyReleaseFiles = () => {
    fs.rmSync(RELEASE_DIRECTORY, {recursive: true, force: true});
    fs.mkdirSync(PACKAGE_DIRECTORY, {recursive: true});

    fs.cpSync(path.join(ROOT_DIRECTORY, 'build'), path.join(PACKAGE_DIRECTORY, 'dock'), {recursive: true});
    fs.cpSync(BRIDGE_SOURCE_DIRECTORY, PACKAGE_DIRECTORY, {recursive: true, filter: source => source !== BRIDGE_TESTS_DIRECTORY});
    fs.cpSync(UPDATER_SOURCE_DIRECTORY, UPDATER_TARGET_DIRECTORY, {recursive: true});
    fs.copyFileSync(path.join(INSTALLER_DIRECTORY, 'configure-obs.ps1'), path.join(PACKAGE_DIRECTORY, 'configure-obs.ps1'));
    fs.cpSync(path.join(INSTALLER_DIRECTORY, 'ConfigureObs'), path.join(PACKAGE_DIRECTORY, 'ConfigureObs'), {recursive: true});
    fs.copyFileSync(path.join(ROOT_DIRECTORY, 'LICENSE'), path.join(PACKAGE_DIRECTORY, 'LICENSE'));
    fs.copyFileSync(FONT_LICENSE_SOURCE, FONT_LICENSE_TARGET);
};
