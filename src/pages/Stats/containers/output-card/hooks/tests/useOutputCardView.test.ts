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
import {OutputStatKeyEnum} from '__types/stats/statKeys';
import {HealthLevelEnum} from '__types/stats/views';

import type {Props as CongestionProgressProps} from '../../../../components/congestion-progress/types';
import {HEALTH_TAGS} from '../../consts';
import {useOutputCardView} from '../useOutputCardView';

import {
    LIVE_VIEW,
    MAIN_TARGET,
    MARKUP_TAG_PATTERN,
    PLUGIN_TARGET,
    STATE,
} from './consts';

const {
    Status,
    Source,
    Timecode,
    Dropped,
    Recent,
    Congestion,
} = OutputStatKeyEnum;

const {Ok, Warn} = HealthLevelEnum;

vi.mock('react-redux', () => ({useSelector: vi.fn()}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

vi.mock('i18next', () => ({
    default: {
        language: 'en',
    },
    t: (key: string) => key,
}));

vi.mock('antd', () => ({
    Tag: ({children}: PropsWithChildren) => children,
    theme: {
        useToken: () => ({
            token: {
                colorBgContainer: '#1f1f1f',
            },
        }),
    },
}));

vi.mock('../../../advice-hint', () => ({default: ({children}: PropsWithChildren) => children}));

vi.mock('../../../../components/congestion-progress', () => ({default: ({value}: CongestionProgressProps) => `congestion ${value}`}));

describe('useOutputCardView', () => {
    it('shows the bitrate, time on air, dropped frames, recent drops and congestion of a live output', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        const view = useOutputCardView(MAIN_TARGET);

        const values = Object.fromEntries(view.items.map(({key, value}) => [key, renderToStaticMarkup(createElement(Fragment, null, value)).replace(MARKUP_TAG_PATTERN, '')]));

        expect(view).toMatchObject({
            isActive: true,
            isWaitingForStream: false,
            bitrate: 4000,
            isBitrateLoading: false,
            statusKey: 'stats.statuses.warn',
            healthTag: HEALTH_TAGS[Warn],
        });

        expect(values).toEqual({
            [Source]: 'stats.mainTag',
            [Timecode]: '00:00:11',
            [Dropped]: '3 (0.5%)',
            [Recent]: '3 (0.5%)',
            [Congestion]: 'congestion 0.2',
        });
    });

    it('shows a plain zero when nothing dropped in the last minute', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                view: {
                    ...STATE.stats.view,
                    outputs: {
                        [MAIN_TARGET.key]: {
                            ...LIVE_VIEW,
                            level: Ok,
                            recentDropped: 0,
                        },
                    },
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        const view = useOutputCardView(MAIN_TARGET);

        const recentItem = view.items.find(({key}) => key === Recent);

        expect(renderToStaticMarkup(createElement(Fragment, null, recentItem?.value))).toBe('0');

        expect(view.statusKey).toBe('stats.statuses.ok');
    });

    it('shows the bitrate as loading until the second sample', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                view: {
                    ...STATE.stats.view,
                    outputs: {
                        [MAIN_TARGET.key]: {
                            ...LIVE_VIEW,
                            kbps: null,
                        },
                    },
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        const view = useOutputCardView(MAIN_TARGET);

        expect(view).toMatchObject({bitrate: '—', isBitrateLoading: true});
    });

    it('says reconnecting in the warning colour while the output reconnects', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                view: {
                    ...STATE.stats.view,
                    outputs: {
                        [MAIN_TARGET.key]: {
                            ...LIVE_VIEW,
                            level: Ok,
                            isReconnecting: true,
                        },
                    },
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        const view = useOutputCardView(MAIN_TARGET);

        expect(view).toMatchObject({statusKey: 'stats.statuses.reconnecting', healthTag: HEALTH_TAGS[Warn]});
    });

    it('shows only the source of a plugin stream before its first stream', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        const view = useOutputCardView(PLUGIN_TARGET);

        const values = Object.fromEntries(view.items.map(({key, value}) => [key, renderToStaticMarkup(createElement(Fragment, null, value)).replace(MARKUP_TAG_PATTERN, '')]));

        expect(view).toMatchObject({
            isActive: false,
            isWaitingForStream: true,
            bitrate: '—',
            statusKey: 'stats.statuses.off',
            targetTitle: 'Main channel',
        });

        expect(values).toEqual({[Source]: 'multi-rtmp'});
    });

    it('leaves out the rows and the status the streamer hid', () => {
        const state = {
            ...STATE,
            settings: {
                ...STATE.settings,
                hiddenOutputStats: [Dropped, Status],
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        const view = useOutputCardView(MAIN_TARGET);

        expect(view.items.map(({key}) => key)).toEqual([Source, Timecode, Recent, Congestion]);

        expect(view).toMatchObject({isStatusShown: false, isBitrateShown: true});
    });
});
