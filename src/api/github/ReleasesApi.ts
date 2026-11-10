import {GITHUB_ROUTES} from '__routes/api/github';
import {GithubReleaseDto} from '__types/update/release';
import {BaseApi} from '__utils/api/BaseApi';

import {githubTransport} from './transport/githubTransport';

class ReleasesApi extends BaseApi {
    constructor() {
        super(githubTransport);
    }

    getLatest = () =>
        this.get<GithubReleaseDto>(GITHUB_ROUTES.RELEASES.LATEST);
}

export const releasesApi = new ReleasesApi();
