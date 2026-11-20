import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {settingsHiddenGeneralStatsSelector} from '__selectors/settingsSelectors';
import {statsSelector} from '__selectors/statsSelectors';
import {GeneralStatKeyEnum} from '__types/stats/statKeys';
import {AdviceEnum} from '__types/stats/views';

import LagValue from '../../../components/lag-value';
import {StatItemDto} from '../../../components/stat-list';
import {formatFixed} from '../../../utils/formatFixed';
import {formatGigabytes} from '../../../utils/formatGigabytes';
import {formatMemory} from '../../../utils/formatMemory';
import AdviceHint from '../../advice-hint';
import {KILOBITS_IN_MEGABIT, MIN_TOTAL_BITRATE_STREAMS} from '../consts';
import {getFpsLevel} from '../utils/getFpsLevel';
import {getTotalBitrate} from '../utils/getTotalBitrate';

const {
    TotalBitrate,
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

const {Rendering: RenderingAdvice, Encoding: EncodingAdvice} = AdviceEnum;

export const useItems = (): StatItemDto<GeneralStatKeyEnum>[] => {
    const {view: {general: view, outputs}, hardware: {gpu, systemMemory}, targets} = useSelector(statsSelector);
    const hiddenGeneralStats = useSelector(settingsHiddenGeneralStatsSelector);

    const {t} = useTranslation();

    const totalBitrate = getTotalBitrate(targets, outputs);

    const items: StatItemDto<GeneralStatKeyEnum>[] = [
        ...(totalBitrate.liveCount >= MIN_TOTAL_BITRATE_STREAMS
            ? [{
                key: TotalBitrate,
                label: t('general.totalBitrate'),
                hint: t('general.hints.totalBitrate'),
                value: t('units.megabitsPerSecond', {value: formatFixed(totalBitrate.kbps / KILOBITS_IN_MEGABIT, 1)}),
            }]
            : []),
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
            value: view
                ? (
                    <AdviceHint
                        advice={EncodingAdvice}
                        isShown={view.advices.includes(EncodingAdvice)}
                    >
                        <LagValue lag={view.encoding}/>
                    </AdviceHint>
                )
                : '—',
        },
        {
            key: Rendering,
            label: t('general.rendering'),
            hint: t('general.hints.rendering'),
            value: view
                ? (
                    <AdviceHint
                        advice={RenderingAdvice}
                        isShown={view.advices.includes(RenderingAdvice)}
                    >
                        <LagValue lag={view.rendering}/>
                    </AdviceHint>
                )
                : '—',
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

    return items.filter(({key}) => !hiddenGeneralStats.includes(key));
};
