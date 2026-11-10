import {createLoader} from '__utils/redux/createLoader';

import {actions} from '../actions';
import {releaseNotesApi} from '../api/ReleaseNotesApi';

export const releaseNotesLoader = createLoader(actions.releaseNotes, releaseNotesApi.getList);
