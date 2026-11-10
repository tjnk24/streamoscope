import fs from 'node:fs';

import {
    LATEST_RELEASE_URL_PATTERN,
    PUBLIC_KEY_PATTERN,
    RELEASE_BASE_URL_PATTERN,
    UPDATER_ENTRY_PATH,
} from './consts.ts';

export const stageTestUpdater = (server: string, publicKey: string, entryPath = UPDATER_ENTRY_PATH) => {
    const source = fs.readFileSync(entryPath, 'utf8');

    if (!RELEASE_BASE_URL_PATTERN.test(source) || !LATEST_RELEASE_URL_PATTERN.test(source) || !PUBLIC_KEY_PATTERN.test(source)) {
        throw new Error(`${entryPath} no longer has the defaults the test build replaces`);
    }

    const patched = source
        .replace(RELEASE_BASE_URL_PATTERN, (_match, start: string, end: string) => `${start}${server}/download${end}`)
        .replace(LATEST_RELEASE_URL_PATTERN, (_match, start: string, end: string) => `${start}${server}/releases/latest${end}`)
        .replace(PUBLIC_KEY_PATTERN, (_match, start: string, end: string) => `${start}${publicKey}${end}`);

    fs.writeFileSync(entryPath, patched);
};
