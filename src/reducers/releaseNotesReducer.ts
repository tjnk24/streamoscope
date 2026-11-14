import {RequestStateDto} from '__types/api/request';
import {GithubReleaseDto} from '__types/update/release';
import {createRequestSlice} from '__utils/redux/createRequestSlice';

export type ReleaseNotesReducer = RequestStateDto<GithubReleaseDto[]>;

const slice = createRequestSlice<GithubReleaseDto[]>('releaseNotes');

export default slice;
