import type {Nullable} from 'infrastructure/common';
import isEqual from 'lodash/isEqual';

import {commonActions} from '__actions';
import {connectionSelector} from '__selectors/connectionSelectors';
import {settingsSelector} from '__selectors/settingsSelectors';
import {statsSelector} from '__selectors/statsSelectors';
import {getStore} from '__store';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {PasswordChangeDto, PasswordChangeResultEnum} from '__types/connection/passwordChange';
import {
    InFlightBatchDto,
    ObsEventTypeEnum,
    ObsMessageDto,
    ObsOpCodeEnum,
    ObsSceneCollectionEventDto,
} from '__types/obs/messages';
import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {
    ObsRequestDto,
    ObsRequestResultDto,
    ProfileParameterKeyDto,
    RequestResultPairDto,
} from '__types/obs/requests';
import {getAuthString} from '__utils/auth/getAuthString';
import {getBridgeUpdate} from '__utils/bridge/getBridgeUpdate';
import {getHardware} from '__utils/bridge/getHardware';
import {
    AUTHENTICATION_FAILED_CLOSE_CODE,
    COLLECTION_SWITCH_TIMEOUT_MS,
    CONFIG_EVENT_SUBSCRIPTION,
    DISCOVERY_EVERY_POLLS,
    OBS_RPC_VERSION,
    OBS_WEBSOCKET_PROTOCOL,
    POLL_INTERVAL_MS,
    RECONNECT_INTERVAL_MS,
    REQUEST_TIMEOUT_MS,
} from '__utils/consts';
import {fetchDevObsConnection} from '__utils/dev/fetchDevObsConnection';
import {MockObsSimulator} from '__utils/mock/MockObsSimulator';
import {buildRequests} from '__utils/requests/buildRequests';
import {getObsVersion} from '__utils/requests/getObsVersion';
import {getSceneCollection} from '__utils/requests/getSceneCollection';
import {isRequestOfType} from '__utils/requests/isRequestOfType';
import {StatsTracker} from '__utils/stats/StatsTracker';
import {discoverTargets} from '__utils/targets/discoverTargets';

import {storageService} from './storageService';

const {
    Hello,
    Identify,
    Identified,
    Event,
    RequestBatch,
    RequestBatchResponse,
} = ObsOpCodeEnum;

const {CurrentSceneCollectionChanging, CurrentSceneCollectionChanged} = ObsEventTypeEnum;

const {SetProfileParameter, GetProfileParameter, GetStats} = ObsRequestTypeEnum;

const {Connecting, Closed, NeedPassword, WrongPassword} = ConnectionStatusEnum;

const {Rejected, NoConnection, Accepted} = PasswordChangeResultEnum;

class ObsConnectionService {
    private socket: Nullable<WebSocket> = null;

    private reconnectTimer: Nullable<number> = null;

    private pollTimer: Nullable<number> = null;

    private inFlight: Nullable<InFlightBatchDto> = null;

    private requestId = 0;

    private pollIndex = 0;

    private password = storageService.loadPassword();

    private passwordChange: Nullable<PasswordChangeDto> = null;

    private simulator: Nullable<MockObsSimulator> = null;

    private pendingRequests: ObsRequestDto[] = [];

    private collectionSwitchStartedAt: Nullable<number> = null;

    private isCollectionSwitchFinished = false;

    private readonly tracker = new StatsTracker();

    start = async () => {
        if (process.env.IS_DEV_SERVER) {
            const connection = await fetchDevObsConnection();

            if (connection) {
                commonActions.settings.setPort(connection.port);
                this.password = connection.password;
            }
        }

        this.connect();
    };

    stop = () => {
        this.disconnect();
    };

    logIn = (port: number, password: string) => {
        commonActions.settings.setPort(port);
        this.password = password;

        this.reconnect();
    };

    changePassword = (password: string) => new Promise<PasswordChangeResultEnum>(resolve => {
        this.passwordChange = {password, resolve};

        this.reconnect();
    });

    setMockEnabled = (isEnabled: boolean) => {
        commonActions.settings.setIsMockEnabled(isEnabled);

        this.reconnect();
    };

    setPort = (port: number) => {
        commonActions.settings.setPort(port);

        this.reconnect();
    };

    resetStats = () => {
        commonActions.stats.setView(this.tracker.resetGraphs());
    };

    setProfileParameter = (parameter: ProfileParameterKeyDto, parameterValue: string) => {
        const request: ObsRequestDto = {
            requestType: SetProfileParameter,
            requestData: {
                ...parameter,
                parameterValue,
            },
        };

        this.sendRequest(request);
    };

    sendRequest = (request: ObsRequestDto) => {
        this.pendingRequests.push(request);
        this.poll();
    };

    private reconnect = () => {
        this.disconnect();
        this.connect();
    };

    private connect = () => {
        this.clearReconnectTimer();

        const state = getStore();

        if (settingsSelector(state).isMockEnabled) {
            this.simulator = new MockObsSimulator();

            commonActions.connection.setStatus(ConnectionStatusEnum.Identified);

            this.startPolling();

            return;
        }

        connectionSelector(state).status !== Closed && commonActions.connection.setStatus(Connecting);

        const socket = new WebSocket(`ws://127.0.0.1:${settingsSelector(state).port}`, OBS_WEBSOCKET_PROTOCOL);

        socket.onmessage = ({data}: MessageEvent<string>) => {
            void this.onMessage(socket, JSON.parse(data) as ObsMessageDto);
        };

        socket.onclose = ({code}) => this.onClose(socket, code);

        this.socket = socket;
    };

    private disconnect = () => {
        this.clearReconnectTimer();

        this.simulator = null;

        const {socket} = this;

        this.socket = null;

        if (socket) {
            socket.onmessage = null;
            socket.onclose = null;
            socket.close();
        }

        this.onDisconnected();
    };

    private onDisconnected = () => {
        this.stopPolling();
        this.tracker.reset();

        commonActions.stats.reset();
        commonActions.update.resetBridge();
        commonActions.connection.setSceneCollection(null);
        commonActions.connection.setIsSwitchingCollection(false);

        this.collectionSwitchStartedAt = null;
        this.isCollectionSwitchFinished = false;
        this.pendingRequests = [];
    };

    private onClose = (socket: WebSocket, code: number) => {
        if (socket !== this.socket) {
            return;
        }

        this.socket = null;
        this.onDisconnected();

        commonActions.connection.setLastCloseCode(code);

        if (code === AUTHENTICATION_FAILED_CLOSE_CODE && this.passwordChange) {
            this.finishPasswordChange(Rejected);
            this.connect();

            return;
        }

        this.passwordChange && this.finishPasswordChange(NoConnection);

        if (code === AUTHENTICATION_FAILED_CLOSE_CODE) {
            storageService.savePassword(null);
            this.password = null;

            commonActions.connection.setStatus(WrongPassword);

            return;
        }

        commonActions.connection.setStatus(Closed);
        commonActions.connection.setReconnectAt(Date.now() + RECONNECT_INTERVAL_MS);

        this.reconnectTimer = window.setTimeout(this.connect, RECONNECT_INTERVAL_MS);
    };

    private onMessage = async (socket: WebSocket, {op: opCode, d: data}: ObsMessageDto) => {
        switch (opCode) {
            case Hello: {
                const identify: Record<string, unknown> = {
                    rpcVersion: OBS_RPC_VERSION,
                    eventSubscriptions: CONFIG_EVENT_SUBSCRIPTION,
                };

                const password = this.passwordChange?.password ?? this.password;

                if (data.authentication) {
                    if (!password) {
                        this.disconnect();

                        commonActions.connection.setStatus(NeedPassword);

                        return;
                    }

                    identify.authentication = await getAuthString(password, data.authentication.salt, data.authentication.challenge);
                }

                socket === this.socket && socket.send(JSON.stringify({op: Identify, d: identify}));
                break;
            }

            case Identified:
                this.passwordChange && this.finishPasswordChange(Accepted);
                this.password && storageService.savePassword(this.password);

                commonActions.connection.setStatus(ConnectionStatusEnum.Identified);

                this.startPolling();
                break;

            case Event:
                this.onEvent(data.eventType, data.eventData);
                break;

            case RequestBatchResponse: {
                const {inFlight} = this;

                if (inFlight && inFlight.id === data.requestId) {
                    this.inFlight = null;
                    this.onBatchResults(inFlight.requests, data.results);
                }

                break;
            }

            default:
                break;
        }
    };

    private startPolling = () => {
        this.stopPolling();

        this.pollIndex = 0;

        this.poll();
        this.pollTimer = window.setInterval(this.poll, POLL_INTERVAL_MS);
    };

    private stopPolling = () => {
        this.pollTimer !== null && window.clearInterval(this.pollTimer);
        this.pollTimer = null;
        this.inFlight = null;
    };

    private poll = () => {
        const now = performance.now();

        if (this.simulator) {
            const requests = this.buildBatch();

            this.onBatchResults(requests, this.simulator.answer(requests));

            return;
        }

        if (!this.socket || (this.inFlight && now - this.inFlight.since < REQUEST_TIMEOUT_MS)) {
            return;
        }

        const id = String(++this.requestId);
        const requests = this.buildBatch();

        this.inFlight = {id, since: now, requests};

        const message: ObsMessageDto = {
            op: RequestBatch,
            d: {
                requestId: id,
                haltOnFailure: false,
                requests,
            },
        };

        this.socket.send(JSON.stringify(message));
    };

    private onBatchResults = (requests: ObsRequestDto[], results: ObsRequestResultDto[]) => {
        const pairs = requests.map((request, index) => ({request, result: results[index]}));
        const discovered = discoverTargets(pairs);

        if (discovered && !isEqual(discovered, statsSelector(getStore()).targets)) {
            commonActions.stats.setTargets(discovered);
        }

        this.updateSceneCollection(getSceneCollection(pairs));
        this.finishCollectionSwitch(pairs);

        if (pairs.some(({request, result}) => isRequestOfType(GetProfileParameter)(request) && result?.requestStatus.result)) {
            const {sceneCollection} = connectionSelector(getStore());

            commonActions.stats.setHardware(getHardware(pairs, sceneCollection));
            commonActions.update.setBridge(getBridgeUpdate(pairs, sceneCollection));
        }

        const obsVersion = getObsVersion(pairs);

        if (obsVersion && !isEqual(obsVersion, connectionSelector(getStore()).obsVersion)) {
            commonActions.connection.setObsVersion(obsVersion);
        }

        commonActions.stats.setView(this.tracker.ingest(statsSelector(getStore()).targets, pairs, performance.now()));
    };

    private updateSceneCollection = (sceneCollection: Nullable<string>) => {
        if (sceneCollection === null) {
            return;
        }

        const previousCollection = connectionSelector(getStore()).sceneCollection;

        if (sceneCollection === previousCollection) {
            return;
        }

        previousCollection !== null && commonActions.update.resetBridge();

        commonActions.connection.setSceneCollection(sceneCollection);
    };

    private onEvent = (eventType: string, eventData: Nullable<ObsSceneCollectionEventDto>) => {
        if (eventType === CurrentSceneCollectionChanging) {
            this.collectionSwitchStartedAt = Date.now();
            this.isCollectionSwitchFinished = false;

            commonActions.connection.setIsSwitchingCollection(true);
            commonActions.update.resetBridge();

            return;
        }

        if (eventType === CurrentSceneCollectionChanged) {
            this.isCollectionSwitchFinished = true;

            this.updateSceneCollection(eventData?.sceneCollectionName ?? null);
        }
    };

    private finishCollectionSwitch = (pairs: RequestResultPairDto[]) => {
        const {collectionSwitchStartedAt} = this;

        if (collectionSwitchStartedAt === null) {
            return;
        }

        const isAnswered = pairs.some(({request, result}) => isRequestOfType(GetStats)(request) && result?.requestStatus.result);
        const isTimedOut = Date.now() - collectionSwitchStartedAt > COLLECTION_SWITCH_TIMEOUT_MS;

        if ((this.isCollectionSwitchFinished && isAnswered) || isTimedOut) {
            this.collectionSwitchStartedAt = null;
            this.isCollectionSwitchFinished = false;

            commonActions.connection.setIsSwitchingCollection(false);
        }
    };

    private finishPasswordChange = (result: PasswordChangeResultEnum) => {
        const {passwordChange} = this;

        if (!passwordChange) {
            return;
        }

        this.passwordChange = null;

        if (result === Accepted) {
            this.password = passwordChange.password;
        }

        passwordChange.resolve(result);
    };

    private buildBatch = (): ObsRequestDto[] => {
        const requests = [
            ...buildRequests(statsSelector(getStore()).targets, this.pollIndex++ % DISCOVERY_EVERY_POLLS === 0),
            ...this.pendingRequests,
        ];

        this.pendingRequests = [];

        return requests;
    };

    private clearReconnectTimer = () => {
        this.reconnectTimer !== null && window.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    };
}

export const obsConnectionService = new ObsConnectionService();

import.meta.webpackHot?.decline();
