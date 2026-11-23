import type {IncomingMessage} from 'node:http';

export const isSameOriginRequest = (request: IncomingMessage) => request.headers['sec-fetch-site'] === 'same-origin';
