import {GithubReleaseDto, ReleaseDto} from '__types/update/release';
import {GITHUB_JSON_HEADERS, RELEASES_URL} from '__utils/consts';
import {parseRelease} from '__utils/update/parseRelease';

import {ReleaseNotesModeEnum} from '../../../types';

import {filterReleaseNotes} from './filterReleaseNotes';

export const fetchReleaseNotes = async (mode: ReleaseNotesModeEnum) => {
    const response = await fetch(RELEASES_URL, {headers: GITHUB_JSON_HEADERS});

    if (!response.ok) {
        throw new Error(`GitHub answered ${response.status}`);
    }

    const releases = (await response.json() as GithubReleaseDto[])
        .map(parseRelease)
        .filter((release): release is ReleaseDto => release !== null);

    return filterReleaseNotes(releases, mode, process.env.APP_VERSION);
};
