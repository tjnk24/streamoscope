import {BaseStore} from '__reducers';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

export const NOW = 1_800_000_000_000;

export const STATE = {
    connection: {
        status: ConnectionStatusEnum.Closed,
        reconnectAt: NOW + 2400,
    },
    settings: {
        port: 4455,
    },
} as unknown as BaseStore;
