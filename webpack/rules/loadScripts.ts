import type {Configuration, RuleSetRule} from 'webpack';

import {IS_DEV_SERVER, IS_DEVELOPMENT} from '../consts.ts';

export const loadScripts = () => (webpackConfig: Configuration): Configuration => {
    const scriptRule: RuleSetRule = {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'swc-loader',
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

    webpackConfig.module?.rules?.push(scriptRule);

    return webpackConfig;
};
