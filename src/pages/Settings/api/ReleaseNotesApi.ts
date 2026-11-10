import {githubTransport} from '__api/github/transport/githubTransport';
import {GITHUB_ROUTES} from '__routes/api/github';
import {GithubReleaseDto, GithubReleasesQueryDto} from '__types/update/release';
import {BaseApi} from '__utils/api/BaseApi';

class ReleaseNotesApi extends BaseApi {
    constructor() {
        super(githubTransport);
    }

    getList = (searchParams: GithubReleasesQueryDto) =>
        this.get<GithubReleaseDto[]>(GITHUB_ROUTES.RELEASES.INDEX, {searchParams});
}

export const releaseNotesApi = new ReleaseNotesApi();
