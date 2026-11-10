import {GithubReleaseDto} from '__types/update/release';

export const GITHUB_RELEASE: GithubReleaseDto = {
    tag_name: 'v0.7.0',
    html_url: 'https://github.com/tjnk24/streamoscope/releases/tag/v0.7.0',
    body: '- New: release notes inside the dock.',
    published_at: '2026-11-10T10:00:00Z',
    draft: false,
    prerelease: false,
};

export const LATEST_RELEASE_URL = 'https://api.github.com/repos/tjnk24/streamoscope/releases/latest';
