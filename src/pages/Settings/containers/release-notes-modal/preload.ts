import {actions} from '../../actions';
import {releaseNotesService} from '../../services/releaseNotesService';

export function onLoad() {
    void releaseNotesService.handleRequest();
}

export function onDispose() {
    actions.releaseNotes.reset();
}
