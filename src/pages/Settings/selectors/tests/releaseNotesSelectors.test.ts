import {
    describe,
    expect,
    it,
} from 'vitest';

import {RequestStatusEnum} from '__types/api/request';

import {
    parsedReleaseNotesSelector,
    releaseNotesIsFailedSelector,
    releaseNotesIsPendingSelector,
    releaseNotesIsSuccessSelector,
} from '../releaseNotesSelectors';

import {RELEASE, RELEASE_NOTES_STATE} from './consts';

const {Pending, Success, Failed} = RequestStatusEnum;

describe('releaseNotes status selectors', () => {
    it.each([
        [Pending, true, false, false],
        [Success, false, true, false],
        [Failed, false, false, true],
        [null, false, false, false],
    ])('read the %s status', (status, isPending, isSuccess, isFailed) => {
        const state = {
            releaseNotes: {
                ...RELEASE_NOTES_STATE,
                status,
            },
        };

        expect(releaseNotesIsPendingSelector(state)).toBe(isPending);
        expect(releaseNotesIsSuccessSelector(state)).toBe(isSuccess);
        expect(releaseNotesIsFailedSelector(state)).toBe(isFailed);
    });
});

describe('parsedReleaseNotesSelector', () => {
    it('keeps only published releases with a version tag and turns them into our releases', () => {
        expect(parsedReleaseNotesSelector({releaseNotes: RELEASE_NOTES_STATE})).toEqual([RELEASE]);
    });

    it('gives an empty list while nothing is loaded', () => {
        expect(parsedReleaseNotesSelector({})).toEqual([]);
    });

    it('hands out the same list while the slice stays the same', () => {
        const state = {releaseNotes: RELEASE_NOTES_STATE};

        expect(parsedReleaseNotesSelector(state)).toBe(parsedReleaseNotesSelector(state));
    });
});
