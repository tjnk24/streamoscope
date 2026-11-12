import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {ensureMinisign} from '../../buildInstaller/ensureMinisign.ts';
import {COMPATIBILITY_FILE_NAME} from '../../serveTestRelease/consts.ts';
import {
    BROKEN_PART_FILES,
    PROJECT_COPY_DIRECTORY,
    SERVED_DIRECTORY,
    TEST_SECRET_KEY_PATH,
    WINDOWS_TAR,
} from '../consts.ts';
import type {BrokenPartType} from '../types/brokenRelease.ts';

import {copyProject} from './copyProject.ts';
import {packageTestRelease} from './packageTestRelease.ts';
import {removeProjectCopy} from './removeProjectCopy.ts';

export const buildNewerRelease = async (version: string, brokenPart?: BrokenPartType) => {
    copyProject(version);

    const packageDirectory = packageTestRelease(PROJECT_COPY_DIRECTORY, version);
    const releaseDirectory = path.dirname(packageDirectory);
    const archivePath = path.join(SERVED_DIRECTORY, `streamoscope-${version}.zip`);
    const compatibilityPath = path.join(SERVED_DIRECTORY, COMPATIBILITY_FILE_NAME);

    if (brokenPart) {
        const {relativePath, content} = BROKEN_PART_FILES[brokenPart];

        fs.writeFileSync(path.join(packageDirectory, relativePath), content);
    }

    fs.rmSync(SERVED_DIRECTORY, {recursive: true, force: true});
    fs.mkdirSync(SERVED_DIRECTORY, {recursive: true});

    const archiving = spawnSync(WINDOWS_TAR, ['-a', '-c', '-f', archivePath, '-C', releaseDirectory, path.basename(packageDirectory)], {stdio: 'inherit'});

    if (archiving.status !== 0) {
        throw new Error('Creating the release archive failed');
    }

    fs.copyFileSync(path.join(packageDirectory, COMPATIBILITY_FILE_NAME), compatibilityPath);
    removeProjectCopy();

    const minisign = await ensureMinisign();

    [archivePath, compatibilityPath].forEach(filePath => {
        const signing = spawnSync(minisign, ['-S', '-s', TEST_SECRET_KEY_PATH, '-m', filePath], {stdio: 'ignore'});

        if (signing.status !== 0) {
            throw new Error(`Signing ${filePath} failed`);
        }
    });

    console.log(`Release ${version}${brokenPart ? ` with a broken ${brokenPart}` : ''} is in ${SERVED_DIRECTORY}`);
};
