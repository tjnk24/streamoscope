import type {KnipConfig} from 'knip';

const config: KnipConfig = {
    project: [
        'src/**/*.{ts,tsx}',
        'webpack/**/*.ts',
        'scripts/**/*.ts',
        'e2e/**/*.ts',
    ],
    paths: {
        '__e2e/*': ['e2e/*'],
    },
};

export default config;
