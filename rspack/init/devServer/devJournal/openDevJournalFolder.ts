import {spawn} from 'node:child_process';
import type {IncomingMessage, ServerResponse} from 'node:http';

import {DEV_JOURNAL_DIRECTORY, FOLDER_OPENERS} from '../../../consts.ts';
import {endWithStatus} from '../endWithStatus.ts';
import {isSameOriginRequest} from '../isSameOriginRequest.ts';

export const openDevJournalFolder = (request: IncomingMessage, response: ServerResponse) => {
    if (!isSameOriginRequest(request)) {
        endWithStatus(response, 403);

        return;
    }

    const folderOpener = spawn(FOLDER_OPENERS[process.platform] ?? 'xdg-open', [DEV_JOURNAL_DIRECTORY], {detached: true, stdio: 'ignore'});

    folderOpener.once('spawn', () => endWithStatus(response, 204));
    folderOpener.once('error', () => endWithStatus(response, 500));
    folderOpener.unref();
};
