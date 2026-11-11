import {
    describe,
    expect,
    it,
} from 'vitest';

import {RequestStatusEnum} from '__types/api/request';

import {createRequestSlice} from '../createRequestSlice';

import {DATA, INITIAL_STATE} from './consts';

const {Pending, Success, Failed} = RequestStatusEnum;

const {reducer, actions} = createRequestSlice<string[]>('items');

describe('createRequestSlice', () => {
    it('starts with nothing loaded', () => {
        expect(reducer(undefined, {type: 'init'})).toEqual(INITIAL_STATE);
    });

    it('keeps the data after a successful request', () => {
        const pending = reducer(INITIAL_STATE, actions.pending());

        expect(pending.status).toBe(Pending);
        expect(reducer(pending, actions.success(DATA))).toEqual({
            ...INITIAL_STATE,
            status: Success,
            data: DATA,
        });
    });

    it('keeps the error text after a failed request and forgets everything on reset', () => {
        const failed = reducer(INITIAL_STATE, actions.failed('GitHub is down'));

        expect(failed).toEqual({
            ...INITIAL_STATE,
            status: Failed,
            error: 'GitHub is down',
        });
        expect(reducer(failed, actions.reset())).toEqual(INITIAL_STATE);
    });
});
