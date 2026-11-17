import {FAKE_MULTI_RTMP_PARAMETER} from '../consts.ts';

import {sendObsRequest} from './sendObsRequest.ts';

export const setFakeMultiRtmp = (isOn: boolean) => {
    const parameter = {
        ...FAKE_MULTI_RTMP_PARAMETER,
        parameterValue: isOn ? 'on' : 'off',
    };

    return sendObsRequest('SetProfileParameter', parameter);
};
