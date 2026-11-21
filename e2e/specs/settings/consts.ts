import {DOCK_VERSION} from '__e2e/consts';
import type {GithubReleaseStubDto} from '__e2e/types';

export const SETTINGS_GROUPS = ['Display', 'Updates', 'Connection', 'Diagnostics'];

export const HIDDEN_OUTPUT_ROW = 'Source';

export const HIDDEN_GENERAL_ROW = 'CPU';

export const KEPT_GENERAL_ROW = 'FPS';

export const RUSSIAN_TEXTS = [
    'OBS подключён',
    'Включены моки: статистика ненастоящая',
    'Статистика появится, когда вы выйдете в эфир на эту площадку.',
];

export const OUT_OF_RANGE_PORT = '70000';

export const PORT_RANGE_ERROR = /^The port is a number from \d+ to \d+$/;

export const LATEST_RELEASE_URL = 'https://api.github.com/repos/tjnk24/streamoscope/releases/latest';

export const NEWER_VERSION = '99.0.0';

export const CURRENT_RELEASE: GithubReleaseStubDto = {
    tag_name: `v${DOCK_VERSION}`,
    draft: false,
    prerelease: false,
    body: 'Release notes',
    html_url: `https://github.com/tjnk24/streamoscope/releases/tag/v${DOCK_VERSION}`,
    published_at: '2026-01-01T00:00:00Z',
};

export const NEWER_RELEASE: GithubReleaseStubDto = {
    ...CURRENT_RELEASE,
    tag_name: `v${NEWER_VERSION}`,
    html_url: `https://github.com/tjnk24/streamoscope/releases/tag/v${NEWER_VERSION}`,
};

export const RELEASES_URL_PATTERN = /^https:\/\/api\.github\.com\/repos\/tjnk24\/streamoscope\/releases\?/;

export const RELEASE_WITH_NOTES: GithubReleaseStubDto = {
    ...CURRENT_RELEASE,
    body: [
        '## Fixes',
        '',
        '- The cards keep their order',
        '- See the [release page](https://github.com/tjnk24/streamoscope/releases)',
        '',
        '> Run the installer once.',
        '',
        '---',
        '',
        '## Исправления',
        '',
        '- Карточки помнят порядок',
    ].join('\n'),
};

export const CORS_HEADERS = {'access-control-allow-origin': '*'};

export const SERVER_ADDRESS_PATTERN = /(rtmps?|srt|rist):\/\/|mycdn\.me|vkvideo\.ru|goodgame\.ru|youtube\.com|live-video\.net/;
