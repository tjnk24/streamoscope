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

export type LagViewDto = {
    skipped: number;
    total: number;
    recentSkipped: number;
};

export type GeneralViewDto = {
    fps: number;
    targetFps: Nullable<number>;
    frameTime: number;
    cpu: number;
    memoryInMb: number;
    encoding: LagViewDto;
    rendering: LagViewDto;
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
};

export type StatsViewDto = {
    outputs: Record<string, OutputViewDto>;
    general: GeneralViewDto | null;
    now: number;
};
