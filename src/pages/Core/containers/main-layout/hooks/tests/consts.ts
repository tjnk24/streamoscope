import {BaseStore} from '__reducers';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

export const STATE = {
    connection: {
        status: ConnectionStatusEnum.Identified,
        isSwitchingCollection: false,
    },
    update: {
        bridge: {
            bridgeVersion: 2,
            updated: 0,
            outputs: [],
        },
        bridgeMissingChecks: 0,
    },
    stats: {
        targets: [{key: 'main'}],
    },
} as unknown as BaseStore;
