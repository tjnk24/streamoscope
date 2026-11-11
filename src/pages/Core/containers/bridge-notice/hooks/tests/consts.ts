import {BaseStore} from '__reducers';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

export const DOCK_HREF = 'file:///C:/Users/Streamer/AppData/Local/Programs/streamoscope/dock/index.html';

export const SCRIPT_PATH = 'C:\\Users\\Streamer\\AppData\\Local\\Programs\\streamoscope\\streamoscope-bridge.lua';

export const SCENE_COLLECTION = 'Main scenes';

export const STATE = {
    connection: {
        status: ConnectionStatusEnum.Identified,
        sceneCollection: SCENE_COLLECTION,
    },
    update: {
        bridgeMissingChecks: 2,
    },
} as unknown as BaseStore;
