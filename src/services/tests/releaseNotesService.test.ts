import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {commonActions} from '__actions';
import {releaseNotesLoader} from '__loaders/releaseNotesLoader';
import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';
import {ReleaseNotesModeEnum} from '__types/update/ReleaseNotesModeEnum';

import {releaseNotesService} from '../releaseNotesService';

import {
    CURRENT_RELEASE_URL,
    CURRENT_VERSION,
    NEWER_RELEASE_URL,
    RELEASES_QUERY,
} from './consts';

const {Current, Newer} = ReleaseNotesModeEnum;

vi.mock('__loaders/releaseNotesLoader', () => ({releaseNotesLoader: vi.fn()}));

vi.mock('__actions', () => ({
    commonActions: {
        releaseNotesModal: {
            setData: vi.fn(),
        },
    },
}));

vi.mock('__services/journal/journalService', () => ({
    journalService: {
        log: vi.fn(),
    },
}));

describe('releaseNotesService', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('loads the last 30 releases', async () => {
        await releaseNotesService.handleRequest();

        expect(releaseNotesLoader).toHaveBeenCalledWith(RELEASES_QUERY);
    });

    it('opens the notes of the running version with its release page', () => {
        vi.stubEnv('APP_VERSION', CURRENT_VERSION);

        releaseNotesService.openCurrent();

        expect(commonActions.releaseNotesModal.setData).toHaveBeenCalledWith({isVisible: true, mode: Current, url: CURRENT_RELEASE_URL});
        expect(journalService.log).toHaveBeenCalledWith(JournalLevelEnum.Info, 'user', 'opened the release notes current');
    });

    it('opens the notes of the newer versions with the given release page', () => {
        releaseNotesService.openNewer(NEWER_RELEASE_URL);

        expect(commonActions.releaseNotesModal.setData).toHaveBeenCalledWith({isVisible: true, mode: Newer, url: NEWER_RELEASE_URL});
        expect(journalService.log).toHaveBeenCalledWith(JournalLevelEnum.Info, 'user', 'opened the release notes newer');
    });
});
