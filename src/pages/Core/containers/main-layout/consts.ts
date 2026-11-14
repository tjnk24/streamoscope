import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {ConnectionBadgeDto} from './types';

const {
    Connecting,
    Closed,
    NeedPassword,
    WrongPassword,
    Identified,
} = ConnectionStatusEnum;

export const CONNECTION_BADGES: Record<ConnectionStatusEnum, ConnectionBadgeDto> = {
    [Connecting]: {status: 'processing', textKey: 'header.connecting'},
    [Closed]: {status: 'error', textKey: 'header.closed'},
    [NeedPassword]: {status: 'warning', textKey: 'header.needPassword'},
    [WrongPassword]: {status: 'warning', textKey: 'header.needPassword'},
    [Identified]: {status: 'success', textKey: 'header.connected'},
};

export const UPDATED_TOAST_KEY = 'updated';

export const UPDATED_TOAST_DURATION_SEC = 8;
