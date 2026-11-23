import fs from 'node:fs';
import path from 'node:path';

import {ensureMinisign} from '../buildInstaller/ensureMinisign.ts';
import {
    PACKAGE_DIRECTORY,
    ROOT_DIRECTORY,
    VERSION,
} from '../packageRelease/consts.ts';

import {PORTABLE_DIRECTORY} from './consts.ts';
import type {InstallLayoutDto} from './InstallLayoutDto.ts';
import {writeInstallLayout} from './writeInstallLayout.ts';
import {writePortableReadme} from './writePortableReadme.ts';

if (!fs.existsSync(PACKAGE_DIRECTORY)) {
    throw new Error(`${path.relative(ROOT_DIRECTORY, PACKAGE_DIRECTORY)} is missing, run npm run package:release first`);
}

const minisignPath = await ensureMinisign();

const portableLayout: InstallLayoutDto = {
    packageDirectory: PACKAGE_DIRECTORY,
    installDirectory: PORTABLE_DIRECTORY,
    version: VERSION,
    minisignPath,
};

fs.rmSync(PORTABLE_DIRECTORY, {recursive: true, force: true});
writeInstallLayout(portableLayout);
writePortableReadme();
fs.copyFileSync(path.join(ROOT_DIRECTORY, 'LICENSE'), path.join(PORTABLE_DIRECTORY, 'LICENSE'));

console.log(`Packaged ${path.relative(ROOT_DIRECTORY, PORTABLE_DIRECTORY)}`);
