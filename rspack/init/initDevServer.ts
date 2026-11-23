import type {Configuration, DevServer} from '@rspack/core';
import dotenv from 'dotenv';

import {DEFAULT_PORT} from '../consts.ts';

import {createDevRoute} from './devServer/createDevRoute.ts';
import {clearDevJournal} from './devServer/devJournal/clearDevJournal.ts';
import {openDevJournalFolder} from './devServer/devJournal/openDevJournalFolder.ts';
import {writeDevJournal} from './devServer/devJournal/writeDevJournal.ts';
import {serveObsConnection} from './devServer/serveObsConnection.ts';

export const initDevServer = () => (rspackConfig: Configuration): Configuration => {
    dotenv.config({quiet: true});

    const devServer: DevServer = {
        static: {
            directory: 'build',
        },
        liveReload: true,
        host: 'localhost',
        open: ['/'],
        port: process.env.PORT || DEFAULT_PORT,
        setupMiddlewares: middlewares => {
            clearDevJournal();

            const devRoutes = [
                createDevRoute({method: 'GET', path: '/dev/obs-connection', handler: serveObsConnection}),
                createDevRoute({method: 'POST', path: '/dev/journal', handler: writeDevJournal}),
                createDevRoute({method: 'POST', path: '/dev/journal/open-folder', handler: openDevJournalFolder}),
            ];

            return [...devRoutes, ...middlewares];
        },
        hot: true,
        client: {
            logging: 'warn',
            overlay: false,
        },
    };

    return Object.assign(rspackConfig, {devServer});
};
