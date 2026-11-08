import type {Nullable} from 'infrastructure/common';

import {BridgeDataDto} from '__types/bridge';
import {MockOutputStateDto} from '__types/mock';
import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {ObsRequestDto, ObsRequestResultDto} from '__types/obs/requests';
import {OBS_RPC_VERSION} from '__utils/consts';

import {
    MOCK_EXTRA_TARGETS,
    MOCK_FPS,
    MOCK_GPU,
    MOCK_MAIN_OUTPUT_NAME,
    MOCK_SCENE_COLLECTION,
    MOCK_SYSTEM_MEMORY,
    MOCK_TWITCH_DELAY_SEC,
    MOCK_TWITCH_OUTPUT_NAME,
    MOCK_TWITCH_SERVER,
    OBS_OUTPUT_NOT_FOUND_CODE,
    OBS_UNKNOWN_REQUEST_CODE,
} from './consts';
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

    private readonly mainOutput = createMockOutput(this.startedAt);

    private twitchOutput: Nullable<MockOutputStateDto> = null;

    private readonly extraOutputs = new Map(MOCK_EXTRA_TARGETS.map(({outputName}) => [outputName, createMockOutput(this.startedAt)]));

    private renderTotalFrames = 0;

    private renderSkippedFrames = 0;

    private encoderSkippedFrames = 0;

    private encoderTotalFrames = 0;

    answer = (requests: ObsRequestDto[]): ObsRequestResultDto[] => {
        const now = performance.now();
        const elapsedSeconds = (now - this.lastTickAt) / 1000;
        const runningSeconds = (now - this.startedAt) / 1000;

        this.lastTickAt = now;
        this.advance(now, elapsedSeconds, runningSeconds);

        return requests.map(request => this.answerRequest(request, now, runningSeconds));
    };

    private isMainDipping = (runningSeconds: number) => runningSeconds % 40 >= 20 && runningSeconds % 40 < 26;

    private isTwitchReconnecting = (runningSeconds: number) => runningSeconds % 60 >= 50 && runningSeconds % 60 < 55;

    private isTwitchDropping = (runningSeconds: number) => runningSeconds % 30 >= 10 && runningSeconds % 30 < 14;

    private getFps = (runningSeconds: number) => {
        const phase = runningSeconds % 90;

        if (phase >= 70 && phase < 74) {
            return 55;
        }

        return phase >= 74 && phase < 78 ? 45 : MOCK_FPS;
    };

    private advance = (now: number, elapsedSeconds: number, runningSeconds: number) => {
        const mainKbps = this.isMainDipping(runningSeconds) ? 6500 : randomBetween(17700, 18300);

        growMockOutput(this.mainOutput, elapsedSeconds, mainKbps, 0);

        if (runningSeconds >= MOCK_TWITCH_DELAY_SEC && !this.twitchOutput) {
            this.twitchOutput = createMockOutput(now);
        }

        if (this.twitchOutput && !this.isTwitchReconnecting(runningSeconds)) {
            const twitchDroppedFrames = this.isTwitchDropping(runningSeconds) ? 5 : 0;

            growMockOutput(this.twitchOutput, elapsedSeconds, randomBetween(5800, 6200), twitchDroppedFrames);
        }

        MOCK_EXTRA_TARGETS.forEach(({outputName, minKbps, maxKbps}) => {
            const output = this.extraOutputs.get(outputName);

            output && growMockOutput(output, elapsedSeconds, randomBetween(minKbps, maxKbps), 0);
        });

        this.renderTotalFrames += Math.round(MOCK_FPS * elapsedSeconds);
        this.renderSkippedFrames += Math.round((MOCK_FPS - this.getFps(runningSeconds)) * elapsedSeconds);
        this.encoderTotalFrames += Math.round(MOCK_FPS * elapsedSeconds);

        if (runningSeconds % 45 < 2) {
            this.encoderSkippedFrames += Math.round(10 * elapsedSeconds);
        }
    };

    private answerRequest = (request: ObsRequestDto, now: number, runningSeconds: number): ObsRequestResultDto => {
        const {requestType} = request;

        switch (requestType) {
            case GetStats:
                return successResult(requestType, {
                    activeFps: this.getFps(runningSeconds),
                    averageFrameRenderTime: randomBetween(0.8, 1.1),
                    cpuUsage: randomBetween(3, 6),
                    memoryUsage: 480,
                    availableDiskSpace: 85000,
                    renderSkippedFrames: this.renderSkippedFrames,
                    renderTotalFrames: this.renderTotalFrames,
                    outputSkippedFrames: this.encoderSkippedFrames,
                    outputTotalFrames: this.encoderTotalFrames,
                });

            case GetStreamStatus:
                return successResult(
                    requestType,
                    buildMockOutputStatus(
                        this.mainOutput,
                        now,
                        this.isMainDipping(runningSeconds) ? 0.6 : 0.02,
                        false,
                    ),
                );

            case GetOutputStatus:
                return this.answerOutputStatus(requestType, String(request.requestData?.outputName), now, runningSeconds);

            case GetStreamServiceSettings:
                return successResult(requestType, {
                    streamServiceType: 'rtmp_common',
                    streamServiceSettings: {service: 'YouTube - RTMPS', server: 'rtmps://a.rtmps.youtube.com:443/live2'},
                });

            case GetOutputList:
                return successResult(requestType, {
                    outputs: [
                        buildMockOutputListItem(MOCK_MAIN_OUTPUT_NAME, true),
                        ...(this.twitchOutput
                            ? [buildMockOutputListItem(MOCK_TWITCH_OUTPUT_NAME, !this.isTwitchReconnecting(runningSeconds))]
                            : []),
                        ...MOCK_EXTRA_TARGETS.map(({outputName}) => buildMockOutputListItem(outputName, true)),
                    ],
                });

            case GetProfileParameter:
                return successResult(requestType, {parameterValue: JSON.stringify(this.buildBridgeData())});

            case GetVideoSettings:
                return successResult(requestType, {fpsNumerator: MOCK_FPS, fpsDenominator: 1});

            case GetSceneCollectionList:
                return successResult(requestType, {currentSceneCollectionName: MOCK_SCENE_COLLECTION, sceneCollections: [MOCK_SCENE_COLLECTION]});

            case SetProfileParameter:
                return successResult(requestType, {});

            case GetVersion:
                return successResult(requestType, {
                    obsVersion: 'mock',
                    obsWebSocketVersion: 'mock',
                    platformDescription: 'mock data',
                    rpcVersion: OBS_RPC_VERSION,
                    availableRequests: Object.values(ObsRequestTypeEnum),
                });

            default:
                return failureResult(requestType, OBS_UNKNOWN_REQUEST_CODE);
        }
    };

    private answerOutputStatus = (requestType: string, outputName: string, now: number, runningSeconds: number) => {
        const extraOutput = this.extraOutputs.get(outputName);

        if (extraOutput) {
            return successResult(requestType, buildMockOutputStatus(extraOutput, now, randomBetween(0.01, 0.05), false));
        }

        if (outputName === MOCK_TWITCH_OUTPUT_NAME && this.twitchOutput) {
            const congestion = this.isTwitchDropping(runningSeconds) ? 0.3 : 0.01;

            return successResult(requestType, buildMockOutputStatus(this.twitchOutput, now, congestion, this.isTwitchReconnecting(runningSeconds)));
        }

        return failureResult(requestType, OBS_OUTPUT_NOT_FOUND_CODE);
    };

    private buildBridgeData = (): BridgeDataDto => ({
        bridgeVersion: 2,
        updated: Math.floor(Date.now() / 1000),
        update: {available: true, status: null},
        sceneCollection: MOCK_SCENE_COLLECTION,
        outputs: [
            ...(this.twitchOutput ? [{name: MOCK_TWITCH_OUTPUT_NAME, server: MOCK_TWITCH_SERVER}] : []),
            ...MOCK_EXTRA_TARGETS.map(({outputName, server}) => ({name: outputName, server})),
        ],
        gpu: {
            ...MOCK_GPU,
            usage: randomBetween(40, 60),
            encoder: randomBetween(15, 25),
        },
        systemMemory: MOCK_SYSTEM_MEMORY,
    });
}
