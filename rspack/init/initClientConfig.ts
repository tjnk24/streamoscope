import {
    type Configuration,
    DefinePlugin,
    HtmlRspackPlugin,
    SwcJsMinimizerRspackPlugin,
} from '@rspack/core';
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
import EslintRspackPlugin from 'eslint-rspack-plugin';
import path from 'node:path';
import {TsCheckerRspackPlugin} from 'ts-checker-rspack-plugin';

import {
    CONTENT_HASH,
    IS_DEV_SERVER,
    IS_DEVELOPMENT,
    LICENSE_COMMENT_PATTERN,
} from '../consts.ts';
import type {InitClientConfigOptions} from '../types.ts';

import {defineGlobals} from './defineGlobals.ts';

export const initClientConfig = ({entry}: InitClientConfigOptions) => (rspackConfig: Configuration): Configuration => {
    const jsMinimizerPlugin = new SwcJsMinimizerRspackPlugin({
        extractComments: {
            condition: LICENSE_COMMENT_PATTERN,
        },
    });

    Object.assign(rspackConfig, {
        target: 'web',
        devtool: IS_DEVELOPMENT && 'source-map',
        entry,
        output: {
            filename: `[name]${CONTENT_HASH}.bundle.js`,
            chunkFilename: `[name]${CONTENT_HASH}.chunk.js`,
            path: path.resolve(rspackConfig.context ?? '', 'build'),
            publicPath: '',
            pathinfo: false,
            clean: true,
        },
        optimization: {
            minimizer: [jsMinimizerPlugin],
        },
    });

    const htmlPlugin = new HtmlRspackPlugin({
        template: './src/index.html',
        favicon: './src/images/streamoscope-icon.png',
    });

    rspackConfig.plugins?.push(new DefinePlugin(defineGlobals()), htmlPlugin);

    if (IS_DEVELOPMENT) {
        const typeCheckerPlugin = new TsCheckerRspackPlugin({
            async: true,
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
            },
        });

        rspackConfig.plugins?.push(typeCheckerPlugin);
    }

    if (IS_DEVELOPMENT && !IS_DEV_SERVER) {
        const eslintPlugin = new EslintRspackPlugin({
            files: 'src/**/*.{ts,tsx,js,jsx}',
            severity: {
                error: 'warning',
            },
            cache: true,
        });

        rspackConfig.plugins?.push(eslintPlugin);
    }

    if (IS_DEV_SERVER) {
        rspackConfig.plugins?.push(new ReactRefreshRspackPlugin());
    }

    return rspackConfig;
};
