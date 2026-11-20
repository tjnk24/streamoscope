import path from 'node:path';
import {pathToFileURL} from 'node:url';

import type {SettingsInitDto} from './types';

export const DOCK_URL = pathToFileURL(path.resolve('build/index.html')).href;

export const SETTINGS_INIT: SettingsInitDto = {
    storageKey: 'streamoscope.settings',
    settings: {
        settingsVersion: 2,
        language: 'en',
        themeMode: 'dark',
        isMockEnabled: true,
        isAutoUpdateEnabled: false,
    },
};

export const CLOCK_INSTALL_TIME = new Date('2026-01-05T11:59:00Z');

export const START_TIME = new Date('2026-01-05T12:00:00Z');

export const MISSING_OBS_THEME_ERROR = /^Failed to load resource: net::ERR_FILE_NOT_FOUND \(file:\/\/\S+\/obs-theme\.js(\?\d+)?\)$/;

export const RANDOM_SEED = 20260105;

export const FIRST_POLL_WAIT_MS = 2000;

export const TOAST_CLOSE_WAIT_MS = 1000;

export const ANIMATION_CLOCK_STEP_MS = 250;

export const NETWORK_REQUEST_PATTERN = /^https?:\/\//;
