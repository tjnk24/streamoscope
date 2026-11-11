import {sendObsRequest} from './sendObsRequest.ts';

export const sendBridgeCommand = (command: string) => {
    const parameter = {
        parameterCategory: 'StreamoScope',
        parameterName: 'UpdateCommand',
        parameterValue: command,
    };

    return sendObsRequest('SetProfileParameter', parameter);
};
