import type {Configuration, RuleSetRule} from 'webpack';

import {CONTENT_HASH} from '../consts.ts';

export const loadAssets = () => (webpackConfig: Configuration): Configuration => {
    const imageRule: RuleSetRule = {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
            filename: `images/[name]${CONTENT_HASH}[ext]`,
        },
    };

    const fontRule: RuleSetRule = {
        test: /\.woff2?$/i,
        type: 'asset/resource',
        generator: {
            filename: `fonts/[name]${CONTENT_HASH}[ext]`,
        },
    };

    webpackConfig.module?.rules?.push(imageRule, fontRule);

    return webpackConfig;
};
