import type {Nullable} from 'infrastructure/common';

import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {RequestResultPairDto} from '__types/obs/requests';
import {
    ObsOutputStatusDto,
    ObsStatsDto,
    ObsVideoSettingsDto,
} from '__types/obs/responses';
import {OutputStateDto} from '__types/stats/tracking';
import {
    GeneralViewDto,
    OutputViewDto,
    StatsViewDto,
} from '__types/stats/views';
import {StreamTargetDto} from '__types/targets';
import {GRAPH_SPAN_SEC, OFF_OUTPUT_VIEW} from '__utils/consts';
import {findResultData} from '__utils/requests/findResultData';
import {isRequestOfType} from '__utils/requests/isRequestOfType';

import {AdviceTracker} from '../AdviceTracker';
import {getHealthLevel} from '../getHealthLevel';
import {LagCounter} from '../LagCounter';

import {createOutputState} from './createOutputState';
import {getGeneralAdvices} from './getGeneralAdvices';
import {getOutputAdvices} from './getOutputAdvices';
import {isStatusRequestOf} from './isStatusRequestOf';

const {GetStats, GetVideoSettings} = ObsRequestTypeEnum;

export class StatsTracker {
    private outputs = new Map<string, OutputStateDto>();

    private readonly encoding = new LagCounter();

    private readonly rendering = new LagCounter();

    private readonly generalAdvice = new AdviceTracker();

    private isLive = false;

    private targetFps: Nullable<number> = null;

    reset() {
        this.outputs.clear();
        this.encoding.reset();
        this.rendering.reset();
        this.generalAdvice.reset();
        this.isLive = false;
        this.targetFps = null;
    }

    resetGraphs(): StatsViewDto {
        this.outputs.clear();
        this.encoding.resetRecent();
        this.rendering.resetRecent();
        this.generalAdvice.reset();

        return {outputs: {}, general: null, now: performance.now()};
    }

    ingest(targets: StreamTargetDto[], pairs: RequestResultPairDto[], now: number): StatsViewDto {
        const outputs: Record<string, OutputViewDto> = {};
        const statuses: Nullable<ObsOutputStatusDto>[] = [];

        this.outputs.forEach((_output, key) => {
            !targets.some(target => target.key === key) && this.outputs.delete(key);
        });

        targets.forEach(({key, outputName}) => {
            const output = this.outputs.get(key) ?? createOutputState();

            this.outputs.set(key, output);

            const isStatusRequest = isStatusRequestOf(outputName);

            if (pairs.some(({request}) => isStatusRequest(request))) {
                const status = findResultData<ObsOutputStatusDto>(pairs, isStatusRequest);

                statuses.push(status);
                output.view = this.ingestOutput(output, status, now);
            }

            outputs[key] = output.view;
        });

        statuses.every(status => status !== null) && this.trackLive(statuses.some(status => status?.outputActive));

        return {
            outputs,
            general: this.ingestGeneral(pairs, now),
            now,
        };
    }

    private trackLive(isLive: boolean) {
        if (isLive && !this.isLive) {
            this.encoding.restart();
            this.rendering.restart();
        }

        this.isLive = isLive;
    }

    private resetOutput(output: OutputStateDto) {
        output.previous = null;
        output.graph = [];
        output.recent.reset();
        output.advice.reset();
    }

    private ingestOutput(output: OutputStateDto, status: ObsOutputStatusDto | null, now: number): OutputViewDto {
        if (!status?.outputActive) {
            this.resetOutput(output);

            return OFF_OUTPUT_VIEW;
        }

        const {outputBytes, outputSkippedFrames, outputTotalFrames} = status;

        const {previous} = output;

        let kbps: number | null = null;

        if (previous && outputBytes >= previous.bytes && now > previous.time) {
            kbps = ((outputBytes - previous.bytes) * 8) / (now - previous.time);
        } else if (previous) {
            output.graph = [];
        }

        output.previous = {time: now, bytes: outputBytes};

        const graph = kbps === null ? output.graph : [...output.graph, {time: now, kbps}];

        output.graph = graph.filter(({time}) => time >= now - (GRAPH_SPAN_SEC * 1000));

        const recent = output.recent.add(now, outputSkippedFrames, outputTotalFrames);
        const level = getHealthLevel(recent.count, recent.total);

        return {
            isActive: true,
            isReconnecting: status.outputReconnecting,
            level,
            kbps,
            timecode: status.outputTimecode,
            dropped: outputSkippedFrames,
            total: outputTotalFrames,
            recentDropped: recent.count,
            recentTotal: recent.total,
            congestion: status.outputCongestion,
            graph: output.graph,
            advices: output.advice.update(now, getOutputAdvices(status.outputReconnecting, level, status.outputCongestion)),
        };
    }

    private ingestGeneral(pairs: RequestResultPairDto[], now: number): GeneralViewDto | null {
        const videoSettings = findResultData<ObsVideoSettingsDto>(pairs, isRequestOfType(GetVideoSettings));

        if (videoSettings && videoSettings.fpsDenominator > 0) {
            this.targetFps = videoSettings.fpsNumerator / videoSettings.fpsDenominator;
        }

        const stats = findResultData<ObsStatsDto>(pairs, isRequestOfType(GetStats));

        if (!stats) {
            this.encoding.resetRecent();
            this.rendering.resetRecent();

            return null;
        }

        const {outputSkippedFrames, outputTotalFrames, renderSkippedFrames, renderTotalFrames} = stats;

        const encoding = this.encoding.add(now, outputSkippedFrames, outputTotalFrames);
        const rendering = this.rendering.add(now, renderSkippedFrames, renderTotalFrames);

        return {
            fps: stats.activeFps,
            targetFps: this.targetFps,
            frameTime: stats.averageFrameRenderTime,
            cpu: stats.cpuUsage,
            memoryInMb: stats.memoryUsage,
            encoding,
            rendering,
            advices: this.generalAdvice.update(now, getGeneralAdvices(encoding, rendering)),
        };
    }
}
