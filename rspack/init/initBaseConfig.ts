import type {Configuration} from '@rspack/core';
import path from 'node:path';

import {
    CACHE_DIRECTORY,
    CACHE_NAME,
    IS_DEVELOPMENT,
    RESOLVE_EXTENSIONS,
} from '../consts.ts';
import type {InitBaseConfigOptions} from '../types.ts';

export const initBaseConfig = ({context}: InitBaseConfigOptions) => (rspackConfig: Configuration): Configuration => Object.assign(rspackConfig, {
    context,
    mode: IS_DEVELOPMENT ? 'development' : 'production',
    cache: {
        type: 'persistent',
        name: CACHE_NAME,
        ...(CACHE_DIRECTORY && {
            storage: {
                type: 'filesystem',
                directory: CACHE_DIRECTORY,
            },
        }),
    },
    module: {
        rules: [],
    },
    resolve: {
        modules: ['node_modules', path.resolve(context, 'src')],
        extensions: RESOLVE_EXTENSIONS,
        tsConfig: path.resolve(context, 'tsconfig.json'),
    },
    performance: {
        hints: false,
    },
    plugins: [],
});
