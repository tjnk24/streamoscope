import {
    createElement,
    Fragment,
    PropsWithChildren,
} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {useSelector} from 'react-redux';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {BaseStore} from '__reducers';
import {GeneralStatKeyEnum} from '__types/stats/statKeys';
import {HealthLevelEnum} from '__types/stats/views';

import type {Props as LagValueProps} from '../../../../components/lag-value/types';
import {useItems} from '../useItems';

import {
    GENERAL_VIEW,
    HARDWARE,
    MARKUP_TAG_PATTERN,
    STATE,
} from './consts';

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

vi.mock('react-redux', () => ({useSelector: vi.fn()}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, string>) => (values ? `${key} ${Object.values(values).join(' ')}` : key),
        i18n: {
            language: 'en',
        },
    }),
}));

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
    t: (key: string, values?: Record<string, string>) => (values ? `${key} ${Object.values(values).join(' ')}` : key),
}));

vi.mock('../../../advice-hint', () => ({default: ({children}: PropsWithChildren) => children}));

vi.mock('../../../../components/lag-value', () => ({default: ({lag}: LagValueProps) => `${lag.skipped} of ${lag.total}, ${lag.recentSkipped} of ${lag.recentTotal}`}));

describe('useItems', () => {
    it('shows every number of the OBS card', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        const items = useItems();

        const values = Object.fromEntries(items.map(({key, value}) => [key, renderToStaticMarkup(createElement(Fragment, null, value)).replace(MARKUP_TAG_PATTERN, '')]));

        expect(values).toEqual({
            [TotalBitrate]: 'units.megabitsPerSecond 6.5',
            [Fps]: '59.94',
            [FrameTime]: 'units.milliseconds 1.2',
            [Encoding]: '10 of 760, 3 of 60',
            [Rendering]: '1 of 760, 0 of 60',
            [Cpu]: '5.4%',
            [Gpu]: '43.7%',
            [GpuEncoder]: '19.4%',
            [GpuMemory]: 'units.gigabytes 5.3',
            [Memory]: 'units.megabytes 480',
            [SystemMemory]: 'units.gigabytesOf 14.2 31.9',
        });

        expect(items.find(({key}) => key === Gpu)?.label).toBe('general.gpuWithName NVIDIA GeForce RTX 4070 SUPER');
    });

    it.each([
        {fps: 60, level: undefined},
        {fps: 56, level: HealthLevelEnum.Warn},
        {fps: 47, level: HealthLevelEnum.Bad},
    ])('marks $fps FPS of 60 as $level', ({fps, level}) => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                view: {
                    ...STATE.stats.view,
                    general: {
                        ...GENERAL_VIEW,
                        fps,
                    },
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useItems().find(({key}) => key === Fps)?.level).toBe(level);
    });

    it('leaves out the total upload with one stream and the computer rows without the bridge', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                targets: [STATE.stats.targets[0]],
                hardware: {
                    cpu: null,
                    gpu: null,
                    systemMemory: null,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useItems().map(({key}) => key)).toEqual([Fps, FrameTime, Encoding, Rendering, Memory]);
    });

    it('shows dashes until OBS answers with its stats', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                view: {
                    ...STATE.stats.view,
                    general: null,
                },
                hardware: {
                    ...HARDWARE,
                    gpu: null,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        const items = useItems();

        const values = Object.fromEntries(items.map(({key, value}) => [key, renderToStaticMarkup(createElement(Fragment, null, value))]));

        expect(values).toMatchObject({
            [Fps]: '—',
            [FrameTime]: '—',
            [Encoding]: '—',
            [Rendering]: '—',
            [Memory]: '—',
        });
    });

    it('leaves out the rows the streamer hid', () => {
        const state = {
            ...STATE,
            settings: {
                ...STATE.settings,
                hiddenGeneralStats: [Cpu, Memory, GpuEncoder],
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useItems().map(({key}) => key)).toEqual([TotalBitrate, Fps, FrameTime, Encoding, Rendering, Gpu, GpuMemory, SystemMemory]);
    });
});
