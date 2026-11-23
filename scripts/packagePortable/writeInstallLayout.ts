import fs from 'node:fs';
import path from 'node:path';

import {
    CURRENT_VERSION_TEMPLATE,
    LOADER_DIRECTORY,
    MINISIGN_LICENSE_PATH,
} from './consts.ts';
import type {InstallLayoutDto} from './InstallLayoutDto.ts';

export const writeInstallLayout = ({packageDirectory, installDirectory, version, minisignPath}: InstallLayoutDto) => {
    const versionDirectory = path.join(installDirectory, 'versions', version);
    const updaterDirectory = path.join(installDirectory, 'updater');
    const packageReadme = path.join(packageDirectory, 'README.txt');

    fs.mkdirSync(path.join(installDirectory, 'dock'), {recursive: true});
    fs.mkdirSync(updaterDirectory, {recursive: true});

    fs.cpSync(packageDirectory, versionDirectory, {recursive: true, filter: source => source !== packageReadme});
    fs.copyFileSync(path.join(LOADER_DIRECTORY, 'streamoscope-bridge.lua'), path.join(installDirectory, 'streamoscope-bridge.lua'));
    fs.copyFileSync(path.join(LOADER_DIRECTORY, 'index.html'), path.join(installDirectory, 'dock', 'index.html'));
    fs.copyFileSync(minisignPath, path.join(updaterDirectory, 'minisign.exe'));
    fs.copyFileSync(MINISIGN_LICENSE_PATH, path.join(updaterDirectory, 'minisign-LICENSE.txt'));
    fs.writeFileSync(path.join(installDirectory, 'current-version.js'), CURRENT_VERSION_TEMPLATE.replace('{version}', version));
};
