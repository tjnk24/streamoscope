type BuildProcessEnv = {
    NODE_ENV: string;
    IS_DEV_SERVER: boolean;
    APP_VERSION: string;
    BUILD_LABEL: string;
    TEST_UPDATE_SERVER: string;
};

type BuildProcess = {
    env: BuildProcessEnv;
};

declare const process: BuildProcess;
