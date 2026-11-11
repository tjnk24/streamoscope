import {spawn} from 'node:child_process';
import type {Request, Response} from 'webpack-dev-server';

import {DEV_JOURNAL_DIRECTORY, FOLDER_OPENERS} from '../../consts.ts';
import {isSameOriginRequest} from '../isSameOriginRequest.ts';

export const openDevJournalFolder = (request: Request, response: Response) => {
    if (!isSameOriginRequest(request)) {
        response.status(403).end();

        return;
    }

    const folderOpener = spawn(FOLDER_OPENERS[process.platform] ?? 'xdg-open', [DEV_JOURNAL_DIRECTORY], {detached: true, stdio: 'ignore'});

    folderOpener.once('spawn', () => response.status(204).end());
    folderOpener.once('error', () => response.status(500).end());
    folderOpener.unref();
};
