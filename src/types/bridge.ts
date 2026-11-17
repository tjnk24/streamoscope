import type {Nullable} from 'infrastructure/common';

import {BridgeUpdateDto} from './update/bridgeUpdate';

export type BridgeOutputStatsDto = {
    isActive: boolean;
    totalBytes: number;
    totalFrames: number;
    droppedFrames: number;
    durationMs: number;
    congestion: number;
    isReconnecting: boolean;
};

export type BridgeOutputDto = {
    name: string;
    server: string;
    id?: string;
    stats?: BridgeOutputStatsDto;
};

export type MeasuredBridgeOutputDto = {
    name: string;
    server: string;
    id: string;
    stats: BridgeOutputStatsDto;
};

export type BridgeConfiguredTargetDto = {
    id: string;
    name: string;
    server: string;
    title?: string;
};

type GpuStatsDto = {
    name?: Nullable<string>;
    usage: number;
    encoder: number;
    memoryInBytes: number;
    isSharedMemory: boolean;
};

type SystemMemoryDto = {
    used: number;
    total: number;
};

export type HardwareDto = {
    gpu: Nullable<GpuStatsDto>;
    systemMemory: Nullable<SystemMemoryDto>;
};

export type BridgeDataDto = {
    bridgeVersion?: number;
    updated: number;
    sampledAtMs?: number;
    sceneCollection?: string;
    outputs: BridgeOutputDto[];
    configuredTargets?: BridgeConfiguredTargetDto[];
    gpu?: GpuStatsDto;
    systemMemory?: SystemMemoryDto;
    update?: BridgeUpdateDto;
};
