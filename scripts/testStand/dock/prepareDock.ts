import {
    PASSWORD_STORAGE_KEY,
    SETTINGS_STORAGE_KEY,
    STAND_WEBSOCKET_PORT,
} from '../consts.ts';
import {readWebSocketConfig} from '../obs/readWebSocketConfig.ts';

import {evaluateInDock} from './evaluateInDock.ts';

export const prepareDock = async () => {
    const {server_password: password} = readWebSocketConfig();

    const storageScript = `(() => {
        const password = ${JSON.stringify(password)};
        const settings = JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)}) ?? '{"settingsVersion": 2}');

        if (localStorage.getItem(${JSON.stringify(PASSWORD_STORAGE_KEY)}) === password && settings.port === ${STAND_WEBSOCKET_PORT}) {
            return;
        }

        localStorage.setItem(${JSON.stringify(SETTINGS_STORAGE_KEY)}, JSON.stringify({...settings, port: ${STAND_WEBSOCKET_PORT}}));
        localStorage.setItem(${JSON.stringify(PASSWORD_STORAGE_KEY)}, password);
        location.reload();
    })()`;

    await evaluateInDock(storageScript);
};
