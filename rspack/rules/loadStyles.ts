import {
    type Configuration,
    CssExtractRspackPlugin,
    type RuleSetRule,
} from '@rspack/core';

import {CONTENT_HASH, IS_DEVELOPMENT} from '../consts.ts';

export const loadStyles = () => (rspackConfig: Configuration): Configuration => {
    const extractPlugin = new CssExtractRspackPlugin({
        chunkFilename: `[name]${CONTENT_HASH}.css`,
        filename: `[name]${CONTENT_HASH}.css`,
        ignoreOrder: true,
    });

    const styleRule: RuleSetRule = {
        test: /\.(s*)css$/,
        use: [
            {
                loader: IS_DEVELOPMENT ? 'style-loader' : CssExtractRspackPlugin.loader,
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

    rspackConfig.plugins?.push(extractPlugin);
    rspackConfig.module?.rules?.push(styleRule);

    return rspackConfig;
};
