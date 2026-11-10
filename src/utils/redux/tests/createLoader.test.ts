import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {createLoader} from '../createLoader';

import {DATA, PARAMS} from './consts';

describe('createLoader', () => {
    it('hands the loader parameters over to the request', async () => {
        const actions = {
            pending: vi.fn(),
            success: vi.fn(),
            failed: vi.fn(),
        };
        const request = vi.fn<(params: Record<string, number>) => Promise<string[]>>().mockResolvedValue(DATA);

        await createLoader(actions, request)(PARAMS);

        expect(request).toHaveBeenCalledWith(PARAMS);
    });

    it('marks the request pending, then hands over the data', async () => {
        const actions = {
            pending: vi.fn(),
            success: vi.fn(),
            failed: vi.fn(),
        };

        await createLoader(actions, () => Promise.resolve(DATA))();

        expect(actions.pending).toHaveBeenCalledOnce();
        expect(actions.success).toHaveBeenCalledWith(DATA);
        expect(actions.pending.mock.invocationCallOrder[0]).toBeLessThan(actions.success.mock.invocationCallOrder[0]);
        expect(actions.failed).not.toHaveBeenCalled();
    });

    it('turns a failed request into the error text and does not throw', async () => {
        const actions = {
            pending: vi.fn(),
            success: vi.fn(),
            failed: vi.fn(),
        };

        await createLoader(actions, () => Promise.reject(new Error('GitHub is down')))();

        expect(actions.failed).toHaveBeenCalledWith('GitHub is down');
        expect(actions.success).not.toHaveBeenCalled();
    });
});
