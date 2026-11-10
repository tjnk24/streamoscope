import ky from 'ky';

import {parseJsonBody} from '__utils/api/parseJsonBody';

import {DEV_BASE_URL} from './consts';

export const devTransport = /*#__PURE__*/ ky.create({
    baseUrl: DEV_BASE_URL,
    parseJson: parseJsonBody,
});
