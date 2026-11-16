import {FAKE_MULTI_RTMP_PARAMETER, FAKE_MULTI_RTMP_SETTINGS} from '../consts.ts';

import {sendObsRequest} from './sendObsRequest.ts';

export const setFakeMultiRtmp = (isOn: boolean) => {
    const parameter = {
        ...FAKE_MULTI_RTMP_PARAMETER,
        parameterValue: isOn ? JSON.stringify(FAKE_MULTI_RTMP_SETTINGS) : 'off',
    };

    return sendObsRequest('SetProfileParameter', parameter);
};
