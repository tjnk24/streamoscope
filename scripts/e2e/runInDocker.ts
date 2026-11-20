import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

import {
    CONTAINER_PROJECT_DIRECTORY,
    PLAYWRIGHT_CLI,
    PLAYWRIGHT_IMAGE,
    PLAYWRIGHT_IMAGE_SYSTEM,
    PLAYWRIGHT_PACKAGE,
} from './consts.ts';

const {version} = createRequire(import.meta.url)(PLAYWRIGHT_PACKAGE) as {version: string};

const image = `${PLAYWRIGHT_IMAGE}:v${version}-${PLAYWRIGHT_IMAGE_SYSTEM}`;

const dockerArguments = [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--volume',
    `${process.cwd()}:${CONTAINER_PROJECT_DIRECTORY}`,
    '--workdir',
    CONTAINER_PROJECT_DIRECTORY,
    '--env',
    'CI',
    image,
    'node',
    PLAYWRIGHT_CLI,
    'test',
    ...process.argv.slice(2),
];

console.log(`Running the e2e tests in ${image}`);

const {status} = spawnSync('docker', dockerArguments, {stdio: 'inherit'});

process.exitCode = status ?? 1;
