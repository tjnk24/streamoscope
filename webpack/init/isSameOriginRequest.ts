import type {Request} from 'webpack-dev-server';

export const isSameOriginRequest = (request: Request) => request.get('sec-fetch-site') === 'same-origin';
