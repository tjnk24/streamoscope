import fs from 'node:fs';
import path from 'node:path';

import {INSTALLER_DIRECTORY} from '../../packageRelease/consts.ts';
import {DOCK_LOADER_VERSION_LINE, INSTALL_DIRECTORY} from '../consts.ts';

export const setDockLoaderDelay = (delayMs: number) => {
    const source = fs.readFileSync(path.join(INSTALLER_DIRECTORY, 'loader', 'index.html'), 'utf8');

    if (!source.includes(DOCK_LOADER_VERSION_LINE)) {
        throw new Error(`The dock loader no longer has the line ${DOCK_LOADER_VERSION_LINE}`);
    }

    const delayedLine = `setTimeout(function () { ${DOCK_LOADER_VERSION_LINE} }, ${delayMs});`;
    const loader = delayMs > 0 ? source.replace(DOCK_LOADER_VERSION_LINE, delayedLine) : source;

    fs.writeFileSync(path.join(INSTALL_DIRECTORY, 'dock', 'index.html'), loader);
};
