import type {Nullable} from 'infrastructure/common';

export type GraphPointDto = {
    time: number;
    kbps: number;
};

export enum HealthLevelEnum {
    Ok = 'ok',
    Warn = 'warn',
    Bad = 'bad',
    Off = 'off',
}

export enum AdviceEnum {
    Reconnecting = 'reconnecting',
    DroppedFrames = 'droppedFrames',
    Congestion = 'congestion',
    Rendering = 'rendering',
    Encoding = 'encoding',
}

export type LagViewDto = {
    skipped: number;
    total: number;
    recentSkipped: number;
    recentTotal: number;
};

export type GeneralViewDto = {
    fps: number;
    targetFps: Nullable<number>;
    frameTime: number;
    cpu: number;
    memoryInMb: number;
    encoding: LagViewDto;
    rendering: LagViewDto;
    advices: AdviceEnum[];
};

export type OutputViewDto = {
    isActive: boolean;
    isReconnecting: boolean;
    level: HealthLevelEnum;
    kbps: number | null;
    timecode: string;
    dropped: number;
    total: number;
    recentDropped: number;
    recentTotal: number;
    congestion: number;
    graph: GraphPointDto[];
    advices: AdviceEnum[];
};

export type StatsViewDto = {
    outputs: Record<string, OutputViewDto>;
    general: GeneralViewDto | null;
    now: number;
};
