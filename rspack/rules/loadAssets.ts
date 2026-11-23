import type {Configuration, RuleSetRule} from '@rspack/core';

import {CONTENT_HASH} from '../consts.ts';

export const loadAssets = () => (rspackConfig: Configuration): Configuration => {
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

    rspackConfig.module?.rules?.push(imageRule, fontRule);

    return rspackConfig;
};
