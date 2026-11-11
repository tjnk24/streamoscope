import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import EslintWebpackPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MinimizerPlugin from 'minimizer-webpack-plugin';
import path from 'node:path';
import webpack, {type Configuration} from 'webpack';

import {
    CONTENT_HASH,
    IS_DEV_SERVER,
    IS_DEVELOPMENT,
} from '../consts.ts';
import type {InitClientConfigOptions} from '../types.ts';

import {defineGlobals} from './defineGlobals.ts';

export const initClientConfig = ({entry}: InitClientConfigOptions) => (webpackConfig: Configuration): Configuration => {
    Object.assign(webpackConfig, {
        target: 'web',
        devtool: IS_DEVELOPMENT && 'source-map',
        entry,
        output: {
            filename: `[name]${CONTENT_HASH}.bundle.js`,
            chunkFilename: `[name]${CONTENT_HASH}.chunk.js`,
            path: path.resolve(webpackConfig.context ?? '', 'build'),
            publicPath: '',
            pathinfo: false,
            clean: true,
        },
        optimization: {
            minimizer: [new MinimizerPlugin({minify: MinimizerPlugin.swcMinify, extractComments: true})],
        },
    });

    const htmlPlugin = new HtmlWebpackPlugin({
        template: './src/index.html',
        favicon: './src/images/streamoscope-icon.png',
    });

    webpackConfig.plugins?.push(new webpack.DefinePlugin(defineGlobals()), htmlPlugin);

    if (IS_DEVELOPMENT) {
        const typeCheckerPlugin = new ForkTsCheckerWebpackPlugin({
            async: true,
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
            },
        });

        webpackConfig.plugins?.push(typeCheckerPlugin);
    }

    if (IS_DEVELOPMENT && !IS_DEV_SERVER) {
        const eslintPlugin = new EslintWebpackPlugin({
            files: 'src/**/*.{ts,tsx,js,jsx}',
            emitError: true,
            failOnError: false,
            emitWarning: true,
            failOnWarning: false,
            cache: true,
        });

        webpackConfig.plugins?.push(eslintPlugin);
    }

    if (IS_DEV_SERVER) {
        webpackConfig.plugins?.push(new ReactRefreshWebpackPlugin({overlay: false}));
    }

    return webpackConfig;
};
