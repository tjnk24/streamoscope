import {baseTransport} from '__utils/api/baseTransport';

import {GITHUB_BASE_URL, GITHUB_JSON_HEADERS} from './consts';

export const githubTransport = baseTransport.extend({
    baseUrl: GITHUB_BASE_URL,
    headers: GITHUB_JSON_HEADERS,
});
