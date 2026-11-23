import {GeneralStatKeyEnum} from '__types/stats/statKeys';

const {
    Cpu,
    Gpu,
    GpuEncoder,
    GpuMemory,
    Memory,
    SystemMemory,
} = GeneralStatKeyEnum;

export const COMPUTER_STAT_KEYS = [Cpu, Gpu, GpuEncoder, GpuMemory, Memory, SystemMemory];

export const FPS_WARN_SHARE = 0.95;

export const FPS_BAD_SHARE = 0.8;

export const MIN_TOTAL_BITRATE_STREAMS = 2;

export const KILOBITS_IN_MEGABIT = 1000;
