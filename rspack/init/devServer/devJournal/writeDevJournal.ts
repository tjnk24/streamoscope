import fs from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';

import {DEV_JOURNAL_MAX_REQUEST_BYTES, DEV_JOURNAL_PATH} from '../../../consts.ts';
import {endWithStatus} from '../endWithStatus.ts';
import {isSameOriginRequest} from '../isSameOriginRequest.ts';

export const writeDevJournal = (request: IncomingMessage, response: ServerResponse) => {
    if (!isSameOriginRequest(request)) {
        endWithStatus(response, 403);

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
            endWithStatus(response, 413);

            return;
        }

        try {
            fs.appendFileSync(DEV_JOURNAL_PATH, `${Buffer.concat(chunks).toString('utf8')}\n`);
        } catch {
            endWithStatus(response, 500);

            return;
        }

        endWithStatus(response, 204);
    });
};
