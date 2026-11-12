import {ObsRequestDto} from '__types/obs/requests';
import {JOURNAL_LINES_PARAMETER, UPDATE_COMMAND_PARAMETER} from '__utils/consts';

export const INSTALL_COMMAND = 'install:9.0.0';

export const HEALTHY_COMMAND = 'healthy:0.7.0';

export const AUTO_UPDATE_COMMAND = 'auto:on';

export const JOURNAL_LINES = 'INFO panel started';

export const INSTALL_REQUEST: ObsRequestDto = {
    requestType: 'SetProfileParameter',
    requestData: {
        ...UPDATE_COMMAND_PARAMETER,
        parameterValue: INSTALL_COMMAND,
    },
};

export const HEALTHY_REQUEST: ObsRequestDto = {
    requestType: 'SetProfileParameter',
    requestData: {
        ...UPDATE_COMMAND_PARAMETER,
        parameterValue: HEALTHY_COMMAND,
    },
};

export const AUTO_UPDATE_REQUEST: ObsRequestDto = {
    requestType: 'SetProfileParameter',
    requestData: {
        ...UPDATE_COMMAND_PARAMETER,
        parameterValue: AUTO_UPDATE_COMMAND,
    },
};

export const JOURNAL_LINES_REQUEST: ObsRequestDto = {
    requestType: 'SetProfileParameter',
    requestData: {
        ...JOURNAL_LINES_PARAMETER,
        parameterValue: JOURNAL_LINES,
    },
};
