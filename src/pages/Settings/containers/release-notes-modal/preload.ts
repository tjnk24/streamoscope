import {journalService} from '__services/journal/journalService';
import {getStore} from '__store';
import {JournalLevelEnum} from '__types/journal';

import {actions} from '../../actions';
import {releaseNotesModalSelector} from '../../selectors';

import {fetchReleaseNotes} from './utils/fetchReleaseNotes';

export function onLoad() {
    const {mode} = releaseNotesModalSelector(getStore());

    journalService.log(JournalLevelEnum.Info, 'user', `opened the release notes ${mode}`);

    actions.releaseNotes.setPending();

    fetchReleaseNotes(mode)
        .then(actions.releaseNotes.setReleases)
        .catch((error: unknown) => {
            journalService.log(JournalLevelEnum.Warn, 'update', `release notes failed ${error instanceof Error ? error.message : 'unknown'}`);
            actions.releaseNotes.setFailed();
        });
}

export function onDispose() {
    actions.releaseNotes.reset();
}
