import {commonActions} from '__actions';
import {releaseNotesApi} from '__api/github/ReleaseNotesApi';
import {createLoader} from '__utils/redux/createLoader';

export const releaseNotesLoader = createLoader(commonActions.releaseNotes, releaseNotesApi.getList);
