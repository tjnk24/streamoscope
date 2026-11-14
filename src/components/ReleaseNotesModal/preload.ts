import {commonActions} from '__actions';
import {releaseNotesService} from '__services/releaseNotesService';

export function onLoad() {
    void releaseNotesService.handleRequest();
}

export function onDispose() {
    commonActions.releaseNotes.reset();
}
