import type {ServerResponse} from 'node:http';

export const endWithStatus = (response: ServerResponse, statusCode: number) => {
    response.statusCode = statusCode;

    response.end();
};
