import {GithubReleaseDto} from '__types/update/release';
import {createRequestSlice} from '__utils/redux/createRequestSlice';

const slice = createRequestSlice<GithubReleaseDto[]>('releaseNotes');

export default slice;
