import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {releaseNotesLoader} from '../../loaders/releaseNotesLoader';
import {releaseNotesService} from '../releaseNotesService';

import {RELEASES_QUERY} from './consts';

vi.mock('../../loaders/releaseNotesLoader', () => ({releaseNotesLoader: vi.fn()}));

describe('releaseNotesService', () => {
    it('loads the last 30 releases', async () => {
        await releaseNotesService.handleRequest();

        expect(releaseNotesLoader).toHaveBeenCalledWith(RELEASES_QUERY);
    });
});
