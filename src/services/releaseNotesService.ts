import type {Nullable} from 'infrastructure/common';

import {commonActions} from '__actions';
import {releaseNotesLoader} from '__loaders/releaseNotesLoader';
import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';
import {ReleaseNotesModeEnum} from '__types/update/ReleaseNotesModeEnum';
import {RELEASES_PAGE_URL} from '__utils/consts';

const {Current, Newer} = ReleaseNotesModeEnum;

class ReleaseNotesService {
    handleRequest = () =>
        releaseNotesLoader({per_page: 30});

    openCurrent = () =>
        this.open(Current, `${RELEASES_PAGE_URL}/tag/v${process.env.APP_VERSION}`);

    openNewer = (url: Nullable<string>) =>
        this.open(Newer, url);

    private open = (mode: ReleaseNotesModeEnum, url: Nullable<string>) => {
        journalService.log(JournalLevelEnum.Info, 'user', `opened the release notes ${mode}`);

        commonActions.releaseNotesModal.setData({isVisible: true, mode, url});
    };
}

export const releaseNotesService = new ReleaseNotesService();
