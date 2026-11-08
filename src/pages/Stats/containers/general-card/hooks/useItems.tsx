import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {statsSelector} from '__selectors/statsSelectors';

import LagValue from '../../../components/lag-value';
import {StatItemDto} from '../../../components/stat-list';
import {formatFixed} from '../../../utils/formatFixed';
import {formatGigabytes} from '../../../utils/formatGigabytes';
import {formatMemory} from '../../../utils/formatMemory';
import {GeneralStatKeyEnum} from '../types';
import {getFpsLevel} from '../utils/getFpsLevel';

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

export const useItems = (): StatItemDto[] => {
    const {view: {general: view}, hardware: {gpu, systemMemory}} = useSelector(statsSelector);

    const {t} = useTranslation();

    return [
        {
            key: Fps,
            label: t('general.fps'),
            hint: t('general.hints.fps'),
            level: view ? getFpsLevel(view.fps, view.targetFps) : undefined,
            value: view ? formatFixed(view.fps, 2) : '—',
        },
        {
            key: FrameTime,
            label: t('general.frameTime'),
            value: view ? t('units.milliseconds', {value: formatFixed(view.frameTime, 1)}) : '—',
        },
        {
            key: Encoding,
            label: t('general.encoding'),
            hint: t('general.hints.encoding'),
            value: view ? <LagValue lag={view.encoding}/> : '—',
        },
        {
            key: Rendering,
            label: t('general.rendering'),
            hint: t('general.hints.rendering'),
            value: view ? <LagValue lag={view.rendering}/> : '—',
        },
        {
            key: Cpu,
            label: t('general.cpu'),
            value: view ? `${formatFixed(view.cpu, 1)}%` : '—',
        },
        {
            key: Memory,
            label: t('general.memory'),
            hint: t('general.hints.memory'),
            value: view ? formatMemory(view.memoryInMb) : '—',
        },
        ...(gpu
            ? [
                {
                    key: Gpu,
                    label: gpu.name ? t('general.gpuWithName', {name: gpu.name}) : t('general.gpu'),
                    hint: t('general.hints.gpu'),
                    value: `${formatFixed(gpu.usage, 1)}%`,
                },
                {
                    key: GpuEncoder,
                    label: t('general.gpuEncoder'),
                    hint: t('general.hints.gpuEncoder'),
                    value: `${formatFixed(gpu.encoder, 1)}%`,
                },
                {
                    key: GpuMemory,
                    label: gpu.isSharedMemory ? t('general.gpuSharedMemory') : t('general.gpuMemory'),
                    hint: gpu.isSharedMemory ? t('general.hints.gpuSharedMemory') : undefined,
                    value: t('units.gigabytes', {value: formatGigabytes(gpu.memoryInBytes)}),
                },
            ]
            : []),
        ...(systemMemory
            ? [{
                key: SystemMemory,
                label: t('general.systemMemory'),
                value: t('units.gigabytesOf', {used: formatGigabytes(systemMemory.used), total: formatGigabytes(systemMemory.total)}),
            }]
            : []),
    ];
};
