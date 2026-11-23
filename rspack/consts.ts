import os from 'node:os';
import path from 'node:path';

export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

export const IS_DEV_SERVER = Boolean(process.env.RSPACK_SERVE);

export const TEST_UPDATE_SERVER = process.env.TEST_UPDATE_SERVER || '';

export const CACHE_DIRECTORY = process.env.RSPACK_CACHE_DIRECTORY || '';

export const CACHE_NAME = `${IS_DEVELOPMENT ? 'development' : 'production'}-${IS_DEV_SERVER ? 'server' : 'build'}`;

export const CONTENT_HASH = IS_DEVELOPMENT ? '' : '.[contenthash:8]';

export const LICENSE_COMMENT_PATTERN = /^!|@license|@preserve/;

export const RESOLVE_EXTENSIONS = ['.js', '.ts', '.tsx', '.json'];

export const DEFAULT_PORT = 3062;

export const DEV_JOURNAL_DIRECTORY = path.join(import.meta.dirname, '..', '.dev-journal');

export const DEV_JOURNAL_PATH = path.join(DEV_JOURNAL_DIRECTORY, 'streamoscope.log');

export const DEV_JOURNAL_MAX_REQUEST_BYTES = 1024 * 1024;

export const FOLDER_OPENERS: Partial<Record<NodeJS.Platform, string>> = {
    win32: 'explorer.exe',
    darwin: 'open',
};

const OBS_CONFIG_DIRECTORIES: Partial<Record<NodeJS.Platform, string>> = {
    win32: path.join(process.env.APPDATA || '', 'obs-studio'),
    darwin: path.join(os.homedir(), 'Library', 'Application Support', 'obs-studio'),
};

export const OBS_WEBSOCKET_CONFIG_PATH = path.join(
    OBS_CONFIG_DIRECTORIES[process.platform] || path.join(os.homedir(), '.config', 'obs-studio'),
    'plugin_config',
    'obs-websocket',
    'config.json',
);
