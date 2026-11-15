import {GeneralStatKeyEnum, OutputStatKeyEnum} from '__types/stats/statKeys';

import {StatOptionDto} from './types';

const {
    Status,
    Bitrate,
    Source,
    Timecode,
    Dropped,
    Recent,
    Congestion,
} = OutputStatKeyEnum;

const {
    Fps,
    FrameTime,
    Encoding,
    Rendering,
    Cpu,
    Memory,
    Gpu,
    GpuEncoder,
    GpuMemory,
    SystemMemory,
} = GeneralStatKeyEnum;

export const OUTPUT_STAT_OPTIONS: StatOptionDto<OutputStatKeyEnum>[] = [
    {value: Status, labelKey: 'stats.status'},
    {value: Bitrate, labelKey: 'stats.bitrate'},
    {value: Source, labelKey: 'stats.source'},
    {value: Timecode, labelKey: 'stats.onAir'},
    {value: Dropped, labelKey: 'stats.dropped'},
    {value: Recent, labelKey: 'stats.recent'},
    {value: Congestion, labelKey: 'stats.congestion'},
];

export const GENERAL_STAT_OPTIONS: StatOptionDto<GeneralStatKeyEnum>[] = [
    {value: Fps, labelKey: 'general.fps'},
    {value: FrameTime, labelKey: 'general.frameTime'},
    {value: Encoding, labelKey: 'general.encoding'},
    {value: Rendering, labelKey: 'general.rendering'},
    {value: Cpu, labelKey: 'general.cpu'},
    {value: Memory, labelKey: 'general.memory'},
    {value: Gpu, labelKey: 'general.gpu'},
    {value: GpuEncoder, labelKey: 'general.gpuEncoder'},
    {value: GpuMemory, labelKey: 'general.gpuMemory'},
    {value: SystemMemory, labelKey: 'general.systemMemory'},
];
