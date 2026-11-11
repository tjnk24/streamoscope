import {
    OBS_HELLO_OP,
    OBS_IDENTIFIED_OP,
    OBS_IDENTIFY_OP,
    OBS_REQUEST_OP,
    OBS_REQUEST_RESPONSE_OP,
    OBS_RPC_VERSION,
} from '../consts.ts';
import type {ObsMessageDto} from '../types/obs.ts';

import {buildAuthentication} from './buildAuthentication.ts';
import {readWebSocketConfig} from './readWebSocketConfig.ts';

export const sendObsRequest = (requestType: string, requestData: Record<string, unknown> = {}) => new Promise<Record<string, unknown>>((
    resolve,
    reject,
) => {
    const {server_password: password, server_port: port} = readWebSocketConfig();
    const socket = new WebSocket(`ws://127.0.0.1:${port}`, 'obswebsocket.json');

    socket.addEventListener('error', () => reject(new Error(`No answer from obs-websocket on port ${port}`)));

    socket.addEventListener('message', ({data}) => {
        const {op: opCode, d: messageData} = JSON.parse(String(data)) as ObsMessageDto;
        const {authentication, requestStatus, responseData} = messageData;

        if (opCode === OBS_HELLO_OP) {
            const identifyMessage = {
                op: OBS_IDENTIFY_OP,
                d: {
                    rpcVersion: OBS_RPC_VERSION,
                    eventSubscriptions: 0,
                    authentication: authentication && buildAuthentication(password, authentication),
                },
            };

            socket.send(JSON.stringify(identifyMessage));
        }

        if (opCode === OBS_IDENTIFIED_OP) {
            const requestMessage = {
                op: OBS_REQUEST_OP,
                d: {requestType, requestId: requestType, requestData},
            };

            socket.send(JSON.stringify(requestMessage));
        }

        if (opCode === OBS_REQUEST_RESPONSE_OP) {
            socket.close();

            if (requestStatus?.result) {
                resolve(responseData ?? {});
            } else {
                reject(new Error(`${requestType} failed: ${requestStatus?.code} ${requestStatus?.comment ?? ''}`));
            }
        }
    });
});
