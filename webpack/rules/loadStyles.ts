import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type {Configuration, RuleSetRule} from 'webpack';

import {CONTENT_HASH, IS_DEVELOPMENT} from '../consts.ts';

export const loadStyles = () => (webpackConfig: Configuration): Configuration => {
    const extractPlugin = new MiniCssExtractPlugin({
        chunkFilename: `[name]${CONTENT_HASH}.css`,
        filename: `[name]${CONTENT_HASH}.css`,
        ignoreOrder: true,
    });

    const styleRule: RuleSetRule = {
        test: /\.(s*)css$/,
        use: [
            {
                loader: IS_DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
            },
            {
                loader: 'css-loader',
                options: {
                    sourceMap: IS_DEVELOPMENT,
                    modules: {
                        mode: 'local',
                        namedExport: false,
                        localIdentName: '[local]--[hash:base64:5]',
                    },
                },
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: IS_DEVELOPMENT,
                },
            },
        ],
    };

    webpackConfig.plugins?.push(extractPlugin);
    webpackConfig.module?.rules?.push(styleRule);

    return webpackConfig;
};
