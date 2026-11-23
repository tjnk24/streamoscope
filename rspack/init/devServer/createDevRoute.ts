import type {DevServerMiddlewareHandler} from '@rspack/core';

import type {DevRouteOptions} from '../../types.ts';

export const createDevRoute = ({method, path, handler}: DevRouteOptions): DevServerMiddlewareHandler => (request, response, next) => {
    const {pathname} = new URL(request.url ?? '', 'http://localhost');

    if (request.method !== method || pathname !== path) {
        next();

        return;
    }

    handler(request, response);
};
