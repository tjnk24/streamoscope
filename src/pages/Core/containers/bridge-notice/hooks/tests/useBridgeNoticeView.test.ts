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

import {useBridgeNoticeView} from '../useBridgeNoticeView';

import {
    DOCK_HREF,
    SCENE_COLLECTION,
    SCRIPT_PATH,
    STATE,
} from './consts';

vi.mock('react-redux', () => ({useSelector: vi.fn()}));

describe('useBridgeNoticeView', () => {
    beforeAll(() => {
        const dockWindow = {
            location: {
                href: DOCK_HREF,
            },
        };

        vi.stubGlobal('window', dockWindow);
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it('shows the notice with the script path when the bridge did not answer', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        expect(useBridgeNoticeView()).toEqual({
            isShown: true,
            sceneCollection: SCENE_COLLECTION,
            scriptPath: SCRIPT_PATH,
        });
    });

    it('waits for a second check before showing', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridgeMissingChecks: 1,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useBridgeNoticeView().isShown).toBe(false);
    });

    it('stays hidden when the bridge works', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridgeMissingChecks: 0,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useBridgeNoticeView().isShown).toBe(false);
    });

    it('stays hidden while OBS is not connected', () => {
        const state = {
            ...STATE,
            connection: {
                ...STATE.connection,
                status: ConnectionStatusEnum.Closed,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useBridgeNoticeView().isShown).toBe(false);
    });

});
