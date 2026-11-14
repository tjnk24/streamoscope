import {
    describe,
    expect,
    it,
} from 'vitest';

import {BaseStore} from '__reducers';
import {RequestStatusEnum} from '__types/api/request';

import {
    parsedReleaseNotesSelector,
    releaseNotesIsFailedSelector,
    releaseNotesIsPendingSelector,
    releaseNotesIsSuccessSelector,
} from '../releaseNotesSelectors';

import {
    EMPTY_RELEASE_NOTES_STATE,
    RELEASE,
    RELEASE_NOTES_STATE,
} from './consts';

const {Pending, Success, Failed} = RequestStatusEnum;

describe('releaseNotes status selectors', () => {
    it.each([
        [Pending, true, false, false],
        [Success, false, true, false],
        [Failed, false, false, true],
        [null, false, false, false],
    ])('read the %s status', (status, isPending, isSuccess, isFailed) => {
        const releaseNotes = {...RELEASE_NOTES_STATE, status};

        const state = {releaseNotes} as BaseStore;

        expect(releaseNotesIsPendingSelector(state)).toBe(isPending);
        expect(releaseNotesIsSuccessSelector(state)).toBe(isSuccess);
        expect(releaseNotesIsFailedSelector(state)).toBe(isFailed);
    });
});

describe('parsedReleaseNotesSelector', () => {
    it('keeps only published releases with a version tag and turns them into our releases', () => {
        const state = {releaseNotes: RELEASE_NOTES_STATE} as BaseStore;

        expect(parsedReleaseNotesSelector(state)).toEqual([RELEASE]);
    });

    it('gives an empty list while nothing is loaded', () => {
        const state = {releaseNotes: EMPTY_RELEASE_NOTES_STATE} as BaseStore;

        expect(parsedReleaseNotesSelector(state)).toEqual([]);
    });

    it('hands out the same list while the slice stays the same', () => {
        const state = {releaseNotes: RELEASE_NOTES_STATE} as BaseStore;

        expect(parsedReleaseNotesSelector(state)).toBe(parsedReleaseNotesSelector(state));
    });
});
