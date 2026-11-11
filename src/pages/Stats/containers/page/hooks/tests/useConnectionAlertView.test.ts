import {useSelector} from 'react-redux';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {BaseStore} from '__reducers';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {useConnectionAlertView} from '../useConnectionAlertView';

import {NOW, STATE} from './consts';

vi.mock('react', () => ({useState: (initial: () => number) => [initial(), vi.fn()], useEffect: vi.fn()}));
vi.mock('react-redux', () => ({useSelector: vi.fn()}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: (key: string, values?: object) => (values ? `${key} ${JSON.stringify(values)}` : key)})}));

describe('useConnectionAlertView', () => {
    beforeAll(() => {
        vi.setSystemTime(NOW);
        vi.stubGlobal('window', {});
    });

    afterAll(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('counts the seconds down to the next attempt', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        expect(useConnectionAlertView().title).toBe('connection.closed {"port":4455,"retry":"connection.retryIn {\\"seconds\\":3}"}');
    });

    it('says it is retrying once the attempt is running', () => {
        const state = {
            ...STATE,
            connection: {
                ...STATE.connection,
                reconnectAt: NOW - 500,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useConnectionAlertView().title).toBe('connection.closed {"port":4455,"retry":"connection.retrying"}');
    });

    it('shows the connecting text before the first failure', () => {
        const state = {
            ...STATE,
            connection: {
                ...STATE.connection,
                status: ConnectionStatusEnum.Connecting,
                reconnectAt: null,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useConnectionAlertView()).toEqual({isClosed: false, title: 'connection.connecting', description: null});
    });
});
