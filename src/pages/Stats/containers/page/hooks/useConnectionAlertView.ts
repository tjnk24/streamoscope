import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {connectionSelector} from '__selectors/connectionSelectors';
import {settingsPortSelector} from '__selectors/settingsSelectors';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {RECONNECT_COUNTDOWN_TICK_MS, RECONNECT_INTERVAL_MS} from '__utils/consts';
import {isInsideObs} from '__utils/isInsideObs';

import {ConnectionAlertViewDto} from '../types';

export const useConnectionAlertView = (): ConnectionAlertViewDto => {
    const {status, reconnectAt} = useSelector(connectionSelector);
    const port = useSelector(settingsPortSelector);

    const [_tickedAt, setTickedAt] = useState(Date.now);

    const {t} = useTranslation();

    const isClosed = status === ConnectionStatusEnum.Closed;

    const isWebSocketOff = isClosed && isInsideObs();

    const remainingMs = reconnectAt === null ? RECONNECT_INTERVAL_MS : reconnectAt - Date.now();

    const retry = remainingMs > 0 ? t('connection.retryIn', {seconds: Math.ceil(remainingMs / 1000)}) : t('connection.retrying');

    const closedKey = isWebSocketOff ? 'connection.webSocketOffTitle' : 'connection.closed';

    useEffect(() => {
        if (!isClosed) {
            return undefined;
        }

        const timer = window.setInterval(() => setTickedAt(Date.now()), RECONNECT_COUNTDOWN_TICK_MS);

        return () => window.clearInterval(timer);
    }, [isClosed]);

    return {
        isClosed,
        title: isClosed ? t(closedKey, {port, retry}) : t('connection.connecting'),
        description: isWebSocketOff ? t('connection.webSocketOff', {port, retry}) : null,
    };
};
