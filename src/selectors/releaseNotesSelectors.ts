import {createSelector} from '@reduxjs/toolkit';

import {BaseStore} from '__reducers';
import {ReleaseDto} from '__types/update/release';
import {checkFailed} from '__utils/redux/checkFailed';
import {checkPending} from '__utils/redux/checkPending';
import {checkSuccess} from '__utils/redux/checkSuccess';
import {parseRelease} from '__utils/update/parseRelease';

const releaseNotesSelector = (state: BaseStore) => state.releaseNotes;

export const releaseNotesIsPendingSelector = createSelector(
    [releaseNotesSelector],
    checkPending,
);

export const releaseNotesIsSuccessSelector = createSelector(
    [releaseNotesSelector],
    checkSuccess,
);

export const releaseNotesIsFailedSelector = createSelector(
    [releaseNotesSelector],
    checkFailed,
);

export const parsedReleaseNotesSelector = createSelector(
    [releaseNotesSelector],
    ({data}) => (data ?? [])
        .map(parseRelease)
        .filter((release): release is ReleaseDto => release !== null),
);
