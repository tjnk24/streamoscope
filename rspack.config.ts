import flow from 'lodash/flow.js';

import {
    initBaseConfig,
    initClientConfig,
    initDevServer,
    loadAssets,
    loadScripts,
    loadStyles,
} from './rspack/index.ts';

const rspackConfig = flow([
    initBaseConfig({context: import.meta.dirname}),
    initClientConfig({
        entry: {
            app: ['./src/index.tsx'],
        },
    }),
    initDevServer(),
    loadScripts(),
    loadStyles(),
    loadAssets(),
])({});

export default rspackConfig;
