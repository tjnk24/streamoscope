import fs from 'node:fs';
import type {Request, Response} from 'webpack-dev-server';

import {OBS_WEBSOCKET_CONFIG_PATH} from '../consts.ts';

import {isSameOriginRequest} from './isSameOriginRequest.ts';

export const serveObsConnection = (request: Request, response: Response) => {
    if (!isSameOriginRequest(request)) {
        response.status(403).end();

        return;
    }

    try {
        const config = JSON.parse(fs.readFileSync(OBS_WEBSOCKET_CONFIG_PATH, 'utf8'));

        const connection = {
            port: config.server_port,
            password: config.auth_required ? config.server_password : null,
        };

        response.json(connection);
    } catch {
        response.status(404).end();
    }
};
