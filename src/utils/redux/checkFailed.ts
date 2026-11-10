import {RequestStateDto, RequestStatusEnum} from '__types/api/request';

export const checkFailed = ({status}: RequestStateDto<unknown>) => status === RequestStatusEnum.Failed;
