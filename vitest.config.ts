import path from 'node:path';
import {defineConfig} from 'vitest/config';

import tsconfig from './tsconfig.app.json' with {type: 'json'};

const alias = Object.entries(tsconfig.compilerOptions.paths).map(([key, [target]]) => ({
    find: new RegExp(`^${key.replace('/*', '/(.*)')}$`),
    replacement: path.resolve(import.meta.dirname, target.replace('/*', '/$1')),
}));

export default defineConfig({
    resolve: {
        alias,
    },
    test: {
        include: ['src/**/*.test.ts'],
    },
});
