import {useSelector} from 'react-redux';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {BaseStore} from '__reducers';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {useHeaderStageView} from '../useHeaderStageView';

import {STATE} from './consts';

vi.mock('react-redux', () => ({useSelector: vi.fn()}));

describe('useHeaderStageView', () => {
    it('shows nothing once everything is loaded', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        expect(useHeaderStageView().stageKey).toBeNull();
    });

    it('shows nothing while OBS is not connected', () => {
        const state = {
            ...STATE,
            connection: {
                ...STATE.connection,
                status: ConnectionStatusEnum.Connecting,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useHeaderStageView().stageKey).toBeNull();
    });

    it('puts the scene collection switch first', () => {
        const state = {
            ...STATE,
            connection: {
                ...STATE.connection,
                isSwitchingCollection: true,
            },
            stats: {
                ...STATE.stats,
                targets: [],
            },
            update: {
                ...STATE.update,
                bridge: null,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useHeaderStageView().stageKey).toBe('header.switchingCollection');
    });

    it('waits for the first data before looking for the bridge', () => {
        const state = {
            ...STATE,
            stats: {
                ...STATE.stats,
                targets: [],
            },
            update: {
                ...STATE.update,
                bridge: null,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useHeaderStageView().stageKey).toBe('header.loadingData');
    });

    it('looks for the bridge until the missing checks run out', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: null,
                bridgeMissingChecks: 1,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useHeaderStageView().stageKey).toBe('header.bridgeChecking');
    });

    it('stops looking once the notice is shown', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: null,
                bridgeMissingChecks: 2,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useHeaderStageView().stageKey).toBeNull();
    });
});
