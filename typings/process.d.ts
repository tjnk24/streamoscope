type WebpackProcessEnv = {
    NODE_ENV: string;
    IS_DEV_SERVER: boolean;
    APP_VERSION: string;
    BUILD_LABEL: string;
    TEST_UPDATE_SERVER: string;
};

type WebpackProcess = {
    env: WebpackProcessEnv;
};

declare const process: WebpackProcess;
