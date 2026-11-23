import path from 'node:path';

import {
    INSTALLER_DIRECTORY,
    RELEASE_DIRECTORY,
    VERSION,
} from '../packageRelease/consts.ts';

export const PORTABLE_DIRECTORY = path.join(RELEASE_DIRECTORY, `streamoscope-portable-${VERSION}`);

export const PORTABLE_README_TEMPLATE_PATH = path.join(import.meta.dirname, 'README.template.txt');

export const LOADER_DIRECTORY = path.join(INSTALLER_DIRECTORY, 'loader');

export const MINISIGN_LICENSE_PATH = path.join(INSTALLER_DIRECTORY, 'third-party', 'minisign-LICENSE.txt');

export const CURRENT_VERSION_TEMPLATE = 'window.STREAMOSCOPE_VERSION = \'{version}\';\r\n';
