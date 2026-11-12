import path from 'node:path';

import packageJson from '../../package.json' with {type: 'json'};

export const VERSION = packageJson.version;

export const ROOT_DIRECTORY = path.resolve(import.meta.dirname, '../..');

export const RELEASE_DIRECTORY = path.join(ROOT_DIRECTORY, 'release');

export const PACKAGE_DIRECTORY = path.join(RELEASE_DIRECTORY, `streamoscope-${VERSION}`);

export const FONT_LICENSE_SOURCE = path.join(ROOT_DIRECTORY, 'node_modules', '@fontsource-variable', 'inter', 'LICENSE');

export const FONT_LICENSE_TARGET = path.join(PACKAGE_DIRECTORY, 'dock', 'fonts', 'Inter-LICENSE.txt');

export const BRIDGE_SOURCE_DIRECTORY = path.join(ROOT_DIRECTORY, 'obs-script');

export const BRIDGE_TESTS_DIRECTORY = path.join(BRIDGE_SOURCE_DIRECTORY, 'tests');

export const README_TEMPLATE_PATH = path.join(import.meta.dirname, 'README.template.txt');

export const INSTALLER_DIRECTORY = path.join(ROOT_DIRECTORY, 'installer');

export const UPDATER_SOURCE_DIRECTORY = path.join(INSTALLER_DIRECTORY, 'updater');

export const UPDATER_TARGET_DIRECTORY = path.join(PACKAGE_DIRECTORY, 'updater');
