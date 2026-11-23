import type {EntryObject} from '@rspack/core';
import type {IncomingMessage, ServerResponse} from 'node:http';

export type InitBaseConfigOptions = {
    context: string;
};

export type InitClientConfigOptions = {
    entry: EntryObject;
};

type DevRouteHandler = (request: IncomingMessage, response: ServerResponse) => void;

export type DevRouteOptions = {
    method: string;
    path: string;
    handler: DevRouteHandler;
};
