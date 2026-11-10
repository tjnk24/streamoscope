import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import {buildLatestRelease} from './buildLatestRelease.ts';
import {
    BROKEN_SIGNATURE_FLAG,
    COMPATIBILITY_FILE_NAME,
    CORS_HEADERS,
    DOWNLOAD_PATH_PATTERN,
    LATEST_RELEASE_PATH,
    PACKAGE_SIGNATURE_SUFFIX,
    RELEASES_PATH,
    TEST_RELEASE_HOST,
    TEST_RELEASE_PORT,
    USAGE,
} from './consts.ts';

const [releaseDirectory] = process.argv.slice(2).filter(argument => !argument.startsWith('--'));

if (!releaseDirectory || !fs.existsSync(path.join(releaseDirectory, COMPATIBILITY_FILE_NAME))) {
    throw new Error(USAGE);
}

const isSignatureBroken = process.argv.includes(BROKEN_SIGNATURE_FLAG);
const origin = `http://${TEST_RELEASE_HOST}:${TEST_RELEASE_PORT}`;

const server = http.createServer((request, response) => {
    const {pathname} = new URL(request.url ?? '/', origin);

    response.on('finish', () => console.log(`${request.method} ${pathname} -> ${response.statusCode}`));

    if (request.method === 'OPTIONS') {
        response.writeHead(204, CORS_HEADERS).end();

        return;
    }

    if (pathname === LATEST_RELEASE_PATH || pathname === RELEASES_PATH) {
        const release = buildLatestRelease(releaseDirectory, origin);

        response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'}).end(JSON.stringify(pathname === RELEASES_PATH ? [release] : release));

        return;
    }

    if (pathname === '/') {
        response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8'}).end(`Test release from ${path.resolve(releaseDirectory)}\n`);

        return;
    }

    const [, , fileName] = DOWNLOAD_PATH_PATTERN.exec(pathname) ?? [];
    const servedName = isSignatureBroken && fileName?.endsWith(PACKAGE_SIGNATURE_SUFFIX) ? `${COMPATIBILITY_FILE_NAME}.minisig` : fileName;
    const filePath = servedName && path.join(releaseDirectory, servedName);

    if (!filePath || !fs.existsSync(filePath)) {
        response.writeHead(404, CORS_HEADERS).end();

        return;
    }

    response.writeHead(200, {...CORS_HEADERS, 'Content-Length': fs.statSync(filePath).size});
    fs.createReadStream(filePath).pipe(response);
});

server.listen(TEST_RELEASE_PORT, TEST_RELEASE_HOST, () => {
    console.log(`Test release ${isSignatureBroken ? 'with a broken package signature ' : ''}at ${origin}`);
});
