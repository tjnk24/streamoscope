import {GITHUB_ROUTES} from '__routes/api/github';
import {GithubReleaseDto, GithubReleasesQueryDto} from '__types/update/release';
import {BaseApi} from '__utils/api/BaseApi';

import {githubTransport} from './transport/githubTransport';

class ReleaseNotesApi extends BaseApi {
    constructor() {
        super(githubTransport);
    }

    getList = (searchParams: GithubReleasesQueryDto) =>
        this.get<GithubReleaseDto[]>(GITHUB_ROUTES.RELEASES.INDEX, {searchParams});
}

export const releaseNotesApi = new ReleaseNotesApi();
