import type {Configuration, RuleSetRule} from '@rspack/core';

import {IS_DEV_SERVER, IS_DEVELOPMENT} from '../consts.ts';

export const loadScripts = () => (rspackConfig: Configuration): Configuration => {
    const scriptRule: RuleSetRule = {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'builtin:swc-loader',
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                                development: IS_DEVELOPMENT,
                                refresh: IS_DEV_SERVER,
                            },
                        },
                        target: 'es2022',
                    },
                },
            },
        ],
    };

    rspackConfig.module?.rules?.push(scriptRule);

    return rspackConfig;
};
