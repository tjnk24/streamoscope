import {isHTTPError} from 'ky';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';

import {releasesApi} from '../ReleasesApi';

import {GITHUB_RELEASE, LATEST_RELEASE_URL} from './consts';

vi.mock('__services/journal/journalService', () => ({journalService: {log: vi.fn()}}));

const fetchMock = vi.fn<typeof fetch>();

describe('releasesApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.mocked(journalService.log).mockClear();
        vi.unstubAllGlobals();
    });

    it('asks GitHub for the latest release as JSON and hands the answer over as is', async () => {
        fetchMock.mockResolvedValueOnce(Response.json(GITHUB_RELEASE));

        const release = await releasesApi.getLatest();
        const [request] = fetchMock.mock.calls[0] as [Request];

        expect(release).toEqual(GITHUB_RELEASE);
        expect(request.url).toBe(LATEST_RELEASE_URL);
        expect(request.headers.get('Accept')).toBe('application/vnd.github+json');
    });

    it('fails on an error status and writes it to the journal', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({message: 'API rate limit exceeded'}, {status: 403}));

        const error: unknown = await releasesApi.getLatest().catch((reason: unknown) => reason);

        expect(isHTTPError(error) && error.response.status).toBe(403);
        expect(journalService.log).toHaveBeenCalledWith(JournalLevelEnum.Warn, 'api', expect.stringContaining(`403: GET ${LATEST_RELEASE_URL}`));
    });
});
