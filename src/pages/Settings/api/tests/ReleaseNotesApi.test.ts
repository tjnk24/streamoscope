import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {releaseNotesApi} from '../ReleaseNotesApi';

import {
    GITHUB_RELEASE,
    RELEASES_QUERY,
    RELEASES_URL,
} from './consts';

vi.mock('__services/journal/journalService', () => ({
    journalService: {
        log: vi.fn(),
    },
}));

const fetchMock = vi.fn<typeof fetch>();

describe('releaseNotesApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it('asks GitHub for the releases with the given query as JSON and hands the answer over as is', async () => {
        fetchMock.mockResolvedValueOnce(Response.json([GITHUB_RELEASE]));

        const releases = await releaseNotesApi.getList(RELEASES_QUERY);
        const [request] = fetchMock.mock.calls[0] as [Request];

        expect(releases).toEqual([GITHUB_RELEASE]);
        expect(request.url).toBe(RELEASES_URL);
        expect(request.headers.get('Accept')).toBe('application/vnd.github+json');
    });
});
