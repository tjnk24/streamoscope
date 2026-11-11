import {sendObsRequest} from '../../obs/sendObsRequest.ts';

export const sendJournalParameter = (parameterName: string, parameterValue: string) => {
    const parameter = {
        parameterCategory: 'StreamoScope',
        parameterName,
        parameterValue,
    };

    return sendObsRequest('SetProfileParameter', parameter);
};
