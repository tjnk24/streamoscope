import fs from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';

import {OBS_WEBSOCKET_CONFIG_PATH} from '../../consts.ts';

import {endWithStatus} from './endWithStatus.ts';
import {isSameOriginRequest} from './isSameOriginRequest.ts';

export const serveObsConnection = (request: IncomingMessage, response: ServerResponse) => {
    if (!isSameOriginRequest(request)) {
        endWithStatus(response, 403);

        return;
    }

    try {
        const config = JSON.parse(fs.readFileSync(OBS_WEBSOCKET_CONFIG_PATH, 'utf8'));

        const connection = {
            port: config.server_port,
            password: config.auth_required ? config.server_password : null,
        };

        response.setHeader('Content-Type', 'application/json; charset=utf-8');

        response.end(JSON.stringify(connection));
    } catch {
        endWithStatus(response, 404);
    }
};
