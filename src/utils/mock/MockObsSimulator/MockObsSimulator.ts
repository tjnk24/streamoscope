import type {Nullable} from 'infrastructure/common';

import {BridgeDataDto} from '__types/bridge';
import {MockOutputStateDto} from '__types/mock';
import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {ObsRequestDto, ObsRequestResultDto} from '__types/obs/requests';
import {OBS_RPC_VERSION} from '__utils/consts';

import {
    MOCK_CONFIGURED_TARGETS,
    MOCK_EXTRA_TARGETS,
    MOCK_FIRST_STREAM_DELAY_SEC,
    MOCK_FPS,
    MOCK_GPU,
    MOCK_MAIN_OUTPUT_NAME,
    MOCK_OFF_STREAM_STATUS,
    MOCK_SCENE_COLLECTION,
    MOCK_SYSTEM_MEMORY,
    MOCK_TWITCH_DELAY_SEC,
    MOCK_TWITCH_OUTPUT_ID,
    MOCK_TWITCH_OUTPUT_NAME,
    MOCK_TWITCH_SERVER,
    OBS_OUTPUT_NOT_FOUND_CODE,
    OBS_UNKNOWN_REQUEST_CODE,
} from './consts';
import {buildMockBridgeOutput} from './outputs/buildMockBridgeOutput';
import {buildMockOutputListItem} from './outputs/buildMockOutputListItem';
import {buildMockOutputStatus} from './outputs/buildMockOutputStatus';
import {createMockOutput} from './outputs/createMockOutput';
import {growMockOutput} from './outputs/growMockOutput';
import {randomBetween} from './randomBetween';
import {failureResult} from './results/failureResult';
import {successResult} from './results/successResult';

const {
    GetStats,
    GetStreamStatus,
    GetOutputStatus,
    GetStreamServiceSettings,
    GetOutputList,
    GetProfileParameter,
    SetProfileParameter,
    GetVersion,
    GetVideoSettings,
    GetSceneCollectionList,
} = ObsRequestTypeEnum;

export class MockObsSimulator {
    private readonly startedAt = performance.now();

    private lastTickAt = this.startedAt;

    private mainOutput: Nullable<MockOutputStateDto> = null;

    private twitchOutput: Nullable<MockOutputStateDto> = null;

    private readonly extraOutputs = new Map<string, MockOutputStateDto>();

    private renderTotalFrames = 0;

    private renderSkippedFrames = 0;

    private encoderSkippedFrames = 0;

    private encoderTotalFrames = 0;

    answer = (requests: ObsRequestDto[]): ObsRequestResultDto[] => {
        const now = performance.now();
        const elapsedSeconds = (now - this.lastTickAt) / 1000;
        const streamSeconds = ((now - this.startedAt) / 1000) - MOCK_FIRST_STREAM_DELAY_SEC;

        this.lastTickAt = now;
        this.advance(now, elapsedSeconds, streamSeconds);

        return requests.map(request => this.answerRequest(request, now, streamSeconds));
    };

    private isMainDipping = (streamSeconds: number) => streamSeconds % 40 >= 20 && streamSeconds % 40 < 26;

    private isTwitchReconnecting = (streamSeconds: number) => streamSeconds % 60 >= 50 && streamSeconds % 60 < 55;

    private isTwitchDropping = (streamSeconds: number) => streamSeconds % 30 >= 10 && streamSeconds % 30 < 14;

    private getTwitchCongestion = (streamSeconds: number) => (this.isTwitchDropping(streamSeconds) ? 0.3 : 0.01);

    private getFps = (streamSeconds: number) => {
        const phase = streamSeconds % 90;

        if (phase >= 70 && phase < 74) {
            return 55;
        }

        return phase >= 74 && phase < 78 ? 45 : MOCK_FPS;
    };

    private advance = (now: number, elapsedSeconds: number, streamSeconds: number) => {
        this.renderTotalFrames += Math.round(MOCK_FPS * elapsedSeconds);
        this.renderSkippedFrames += Math.round((MOCK_FPS - this.getFps(streamSeconds)) * elapsedSeconds);

        if (streamSeconds < 0) {
            return;
        }

        if (!this.mainOutput) {
            this.mainOutput = createMockOutput(now);
            MOCK_EXTRA_TARGETS.forEach(({outputId}) => this.extraOutputs.set(outputId, createMockOutput(now)));
        }

        const mainKbps = this.isMainDipping(streamSeconds) ? 6500 : randomBetween(17700, 18300);

        growMockOutput(this.mainOutput, elapsedSeconds, mainKbps, 0);

        if (streamSeconds >= MOCK_TWITCH_DELAY_SEC && !this.twitchOutput) {
            this.twitchOutput = createMockOutput(now);
        }

        if (this.twitchOutput && !this.isTwitchReconnecting(streamSeconds)) {
            const twitchDroppedFrames = this.isTwitchDropping(streamSeconds) ? 5 : 0;

            growMockOutput(this.twitchOutput, elapsedSeconds, randomBetween(5800, 6200), twitchDroppedFrames);
        }

        MOCK_EXTRA_TARGETS.forEach(({outputId, minKbps, maxKbps}) => {
            const output = this.extraOutputs.get(outputId);

            output && growMockOutput(output, elapsedSeconds, randomBetween(minKbps, maxKbps), 0);
        });

        this.encoderTotalFrames += Math.round(MOCK_FPS * elapsedSeconds);

        if (streamSeconds % 45 < 2) {
            this.encoderSkippedFrames += Math.round(10 * elapsedSeconds);
        }
    };

    private answerRequest = (request: ObsRequestDto, now: number, streamSeconds: number): ObsRequestResultDto => {
        const {requestType} = request;

        switch (requestType) {
            case GetStats: {
                const stats = {
                    activeFps: this.getFps(streamSeconds),
                    averageFrameRenderTime: randomBetween(0.8, 1.1),
                    cpuUsage: randomBetween(3, 6),
                    memoryUsage: 480,
                    availableDiskSpace: 85000,
                    renderSkippedFrames: this.renderSkippedFrames,
                    renderTotalFrames: this.renderTotalFrames,
                    outputSkippedFrames: this.encoderSkippedFrames,
                    outputTotalFrames: this.encoderTotalFrames,
                };

                return successResult(requestType, stats);
            }

            case GetStreamStatus: {
                const congestion = this.isMainDipping(streamSeconds) ? 0.6 : 0.02;

                const streamStatus = this.mainOutput ? buildMockOutputStatus(this.mainOutput, now, congestion, false) : MOCK_OFF_STREAM_STATUS;

                return successResult(requestType, streamStatus);
            }

            case GetOutputStatus:
                return this.answerOutputStatus(requestType, String(request.requestData?.outputName), now, streamSeconds);

            case GetStreamServiceSettings: {
                const serviceSettings = {
                    streamServiceType: 'rtmp_common',
                    streamServiceSettings: {service: 'YouTube - RTMPS', server: 'rtmps://a.rtmps.youtube.com:443/live2'},
                };

                return successResult(requestType, serviceSettings);
            }

            case GetOutputList: {
                const twitchOutputs = this.twitchOutput
                    ? [buildMockOutputListItem(MOCK_TWITCH_OUTPUT_NAME, !this.isTwitchReconnecting(streamSeconds))]
                    : [];

                const extraOutputs = MOCK_EXTRA_TARGETS
                    .filter(({outputId}) => this.extraOutputs.has(outputId))
                    .map(({outputName}) => buildMockOutputListItem(outputName, true));

                const mainOutputs = this.mainOutput ? [buildMockOutputListItem(MOCK_MAIN_OUTPUT_NAME, true)] : [];

                const outputs = [...mainOutputs, ...twitchOutputs, ...extraOutputs];

                return successResult(requestType, {outputs});
            }

            case GetProfileParameter:
                return successResult(requestType, {parameterValue: JSON.stringify(this.buildBridgeData(now, streamSeconds))});

            case GetVideoSettings:
                return successResult(requestType, {fpsNumerator: MOCK_FPS, fpsDenominator: 1});

            case GetSceneCollectionList:
                return successResult(requestType, {currentSceneCollectionName: MOCK_SCENE_COLLECTION, sceneCollections: [MOCK_SCENE_COLLECTION]});

            case SetProfileParameter:
                return successResult(requestType, {});

            case GetVersion: {
                const version = {
                    obsVersion: 'mock',
                    obsWebSocketVersion: 'mock',
                    platformDescription: 'mock data',
                    rpcVersion: OBS_RPC_VERSION,
                    availableRequests: Object.values(ObsRequestTypeEnum),
                };

                return successResult(requestType, version);
            }

            default:
                return failureResult(requestType, OBS_UNKNOWN_REQUEST_CODE);
        }
    };

    private answerOutputStatus = (requestType: string, outputName: string, now: number, streamSeconds: number) => {
        if (outputName === MOCK_TWITCH_OUTPUT_NAME && this.twitchOutput) {
            const twitchCongestion = this.getTwitchCongestion(streamSeconds);
            const twitchStatus = buildMockOutputStatus(this.twitchOutput, now, twitchCongestion, this.isTwitchReconnecting(streamSeconds));

            return successResult(requestType, twitchStatus);
        }

        const extraTarget = MOCK_EXTRA_TARGETS.find(target => target.outputName === outputName);
        const extraOutput = extraTarget && this.extraOutputs.get(extraTarget.outputId);

        if (extraOutput) {
            return successResult(requestType, buildMockOutputStatus(extraOutput, now, randomBetween(0.01, 0.05), false));
        }

        return failureResult(requestType, OBS_OUTPUT_NOT_FOUND_CODE);
    };

    private buildBridgeOutputs = (now: number, streamSeconds: number) => {
        const extraOutputs = MOCK_EXTRA_TARGETS.flatMap(({outputName, outputId, server}) => {
            const output = this.extraOutputs.get(outputId);
            const target = {name: outputName, server, id: outputId};

            return output ? [buildMockBridgeOutput(target, output, now, randomBetween(0.01, 0.05), false)] : [];
        });

        if (!this.twitchOutput) {
            return extraOutputs;
        }

        const twitchTarget = {name: MOCK_TWITCH_OUTPUT_NAME, server: MOCK_TWITCH_SERVER, id: MOCK_TWITCH_OUTPUT_ID};
        const twitchCongestion = this.getTwitchCongestion(streamSeconds);
        const twitchOutput = buildMockBridgeOutput(twitchTarget, this.twitchOutput, now, twitchCongestion, this.isTwitchReconnecting(streamSeconds));

        return [twitchOutput, ...extraOutputs];
    };

    private buildBridgeData = (now: number, streamSeconds: number): BridgeDataDto => ({
        bridgeVersion: 8,
        updated: Math.floor(Date.now() / 1000),
        sampledAtMs: Math.floor(now),
        update: {available: true, status: null},
        sceneCollection: MOCK_SCENE_COLLECTION,
        outputs: this.buildBridgeOutputs(now, streamSeconds),
        configuredTargets: MOCK_CONFIGURED_TARGETS,
        gpu: {
            ...MOCK_GPU,
            usage: randomBetween(40, 60),
            encoder: randomBetween(15, 25),
        },
        systemMemory: MOCK_SYSTEM_MEMORY,
    });
}
