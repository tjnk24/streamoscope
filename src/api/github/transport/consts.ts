const GITHUB_REPOSITORY_URL = 'https://api.github.com/repos/tjnk24/streamoscope/';

export const GITHUB_BASE_URL = process.env.TEST_UPDATE_SERVER ? `${process.env.TEST_UPDATE_SERVER}/` : GITHUB_REPOSITORY_URL;

export const GITHUB_JSON_HEADERS: Record<string, string> = {Accept: 'application/vnd.github+json'};
