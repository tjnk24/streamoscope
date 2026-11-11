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
import {updateService} from '__services/updateService';
import {UpdateStageEnum} from '__types/update/bridgeUpdate';
import {CompatibilityProblemEnum} from '__types/update/compatibility';
import {UpdateInstallBlockerEnum} from '__types/update/install';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';

import {useUpdateSettingsView} from '../useUpdateSettingsView';

import {
    BRIDGE,
    CURRENT_VERSION,
    NOW,
    RELEASE,
    RUNNING_STATUS,
    STATE,
} from './consts';

const {Done, Failed} = UpdateStageEnum;

const {NoUpdater, Incompatible} = UpdateInstallBlockerEnum;

vi.mock('react-redux', () => ({useSelector: vi.fn()}));

vi.mock('__services/updateService', () => ({
    updateService: {
        getInstallBlocker: vi.fn(() => null),
        getCompatibility: vi.fn(() => null),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

describe('useUpdateSettingsView', () => {
    beforeAll(() => {
        vi.setSystemTime(NOW);
        vi.stubEnv('APP_VERSION', CURRENT_VERSION);
    });

    afterAll(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('offers a newer version found by a check', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));

        expect(useUpdateSettingsView()).toEqual({
            lastCheckText: 'settings.lastCheck',
            checkText: 'settings.updateAvailable',
            isCheckFailed: false,
            statusText: null,
            isStatusRunning: false,
            errorText: null,
            notes: [],
            isUpdateShown: true,
            isManual: false,
            updateText: 'update.install',
            currentReleaseUrl: 'https://github.com/tjnk24/streamoscope/releases/tag/v0.1.0',
            latestReleaseUrl: RELEASE.url,
            isAutoUpdateEnabled: true,
        });
    });

    it('offers a manual download and says why when there is no updater', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));
        vi.mocked(updateService.getInstallBlocker).mockReturnValueOnce(NoUpdater);

        expect(useUpdateSettingsView()).toMatchObject({isUpdateShown: true, isManual: true, notes: ['update.noUpdater']});
    });

    it('offers a manual download and says why when the release does not fit', () => {
        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(STATE));
        vi.mocked(updateService.getInstallBlocker).mockReturnValueOnce(Incompatible);
        vi.mocked(updateService.getCompatibility).mockReturnValueOnce({problems: [CompatibilityProblemEnum.ObsTooOld], warnings: []});

        expect(useUpdateSettingsView()).toMatchObject({isManual: true, notes: ['update.problems.obsTooOld']});
    });

    it('says the update is being prepared right after the request', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                request: {
                    version: RELEASE.version,
                    requestedAt: NOW - 1000,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({statusText: 'update.stages.preparing', isStatusRunning: true, isUpdateShown: false});
    });

    it('reports when the bridge does not answer the request', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                request: {
                    version: RELEASE.version,
                    requestedAt: NOW - 31_000,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({
            statusText: null,
            errorText: 'update.errors.noResponse',
            isUpdateShown: true,
            updateText: 'update.retry',
        });
    });

    it('shows the stage of a running update, even a background one', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status: RUNNING_STATUS,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({statusText: 'update.stages.downloading', isStatusRunning: true, isUpdateShown: false});
    });

    it('offers the update again when a running status stopped changing', () => {
        const status = {...RUNNING_STATUS, updated: (NOW / 1000) - 600};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({statusText: null, isUpdateShown: true});
    });

    it('says a downloaded version starts with the next OBS launch and hides the button', () => {
        const status = {...RUNNING_STATUS, stage: Done, percent: 100};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({
            statusText: 'settings.updateStaged',
            isStatusRunning: false,
            checkText: null,
            isUpdateShown: false,
        });
    });

    it('reports a failed update and offers to retry', () => {
        const status = {...RUNNING_STATUS, stage: Failed, error: 'signature'};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({
            statusText: null,
            errorText: 'update.errors.signature',
            isUpdateShown: true,
            updateText: 'update.retry',
        });
    });

    it('says the new version was rolled back and offers to try it again', () => {
        const status = {...RUNNING_STATUS, stage: Done, percent: 100};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                    rolledBackVersion: RELEASE.version,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({
            statusText: null,
            errorText: 'update.errors.rolledBack',
            isUpdateShown: true,
            updateText: 'update.retry',
        });
    });

    it('shows the progress of a new attempt instead of the rollback', () => {
        const request = {version: RELEASE.version, requestedAt: NOW - 1000};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                request,
                bridge: {
                    ...BRIDGE,
                    status: RUNNING_STATUS,
                    rolledBackVersion: RELEASE.version,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({statusText: 'update.stages.downloading', errorText: null});
    });

    it('ignores a rollback of a version that is not newer than the running one', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    rolledBackVersion: CURRENT_VERSION,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView().errorText).toBeNull();
    });

    it('falls back to a general text for an unknown error', () => {
        const status = {...RUNNING_STATUS, stage: Failed, error: 'strange'};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView().errorText).toBe('update.errors.unexpected');
    });

    it.each([
        ['the running version', CURRENT_VERSION],
        ['an older version', '0.0.9'],
    ])('ignores a status left from %s', (_name, version) => {
        const status = {...RUNNING_STATUS, version, stage: Failed, error: 'network'};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                bridge: {
                    ...BRIDGE,
                    status,
                },
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({statusText: null, errorText: null});
    });

    it('offers nothing when the running version is the latest', () => {
        const latest = {...RELEASE, version: CURRENT_VERSION};
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                checkStatus: UpdateCheckStatusEnum.UpToDate,
                latest,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({checkText: 'settings.upToDate', isUpdateShown: false});
    });

    it('says when updates were never checked', () => {
        const state = {
            ...STATE,
            settings: {
                ...STATE.settings,
                lastUpdateCheckAt: null,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView().lastCheckText).toBe('settings.neverChecked');
    });

    it('marks a failed check', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                checkStatus: UpdateCheckStatusEnum.Failed,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView()).toMatchObject({checkText: 'settings.checkFailed', isCheckFailed: true});
    });

    it('shows no result before the first check', () => {
        const state = {
            ...STATE,
            update: {
                ...STATE.update,
                checkStatus: UpdateCheckStatusEnum.Idle,
            },
        };

        vi.mocked(useSelector).mockImplementation((selector: (state: BaseStore) => unknown) => selector(state));

        expect(useUpdateSettingsView().checkText).toBeNull();
    });
});
