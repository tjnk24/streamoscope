import fs from 'node:fs';
import type {Request, Response} from 'webpack-dev-server';

import {DEV_JOURNAL_MAX_REQUEST_BYTES, DEV_JOURNAL_PATH} from '../../consts.ts';
import {isSameOriginRequest} from '../isSameOriginRequest.ts';

export const writeDevJournal = (request: Request, response: Response) => {
    if (!isSameOriginRequest(request)) {
        response.status(403).end();

        return;
    }

    const chunks: Buffer[] = [];
    let receivedBytes = 0;

    request.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;

        if (receivedBytes <= DEV_JOURNAL_MAX_REQUEST_BYTES) {
            chunks.push(chunk);
        }
    });

    request.on('end', () => {
        if (receivedBytes > DEV_JOURNAL_MAX_REQUEST_BYTES) {
            response.status(413).end();

            return;
        }

        try {
            fs.appendFileSync(DEV_JOURNAL_PATH, `${Buffer.concat(chunks).toString('utf8')}\n`);
        } catch {
            response.status(500).end();

            return;
        }

        response.status(204).end();
    });
};
