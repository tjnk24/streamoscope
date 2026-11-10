import {releaseNotesLoader} from '../loaders/releaseNotesLoader';

class ReleaseNotesService {
    handleRequest = () =>
        releaseNotesLoader({per_page: 30});
}

export const releaseNotesService = new ReleaseNotesService();
