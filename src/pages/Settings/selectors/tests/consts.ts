import {RequestStateDto, RequestStatusEnum} from '__types/api/request';
import {GithubReleaseDto, ReleaseDto} from '__types/update/release';

const GITHUB_RELEASE: GithubReleaseDto = {
    tag_name: 'v0.7.0',
    html_url: 'https://github.com/tjnk24/streamoscope/releases/tag/v0.7.0',
    body: '- New: release notes inside the dock.',
    published_at: '2026-11-10T10:00:00Z',
    draft: false,
    prerelease: false,
};

export const RELEASE: ReleaseDto = {
    version: '0.7.0',
    url: GITHUB_RELEASE.html_url,
    notes: '- New: release notes inside the dock.',
    publishedAt: '2026-11-10T10:00:00Z',
    compatibility: null,
};

const GITHUB_RELEASES: GithubReleaseDto[] = [
    GITHUB_RELEASE,
    {
        ...GITHUB_RELEASE,
        tag_name: 'v0.8.0',
        draft: true,
    },
    {
        ...GITHUB_RELEASE,
        tag_name: 'v0.8.0-beta.1',
        prerelease: true,
    },
    {
        ...GITHUB_RELEASE,
        tag_name: 'nightly',
    },
];

export const RELEASE_NOTES_STATE: RequestStateDto<GithubReleaseDto[]> = {
    status: RequestStatusEnum.Success,
    data: GITHUB_RELEASES,
    error: null,
};
