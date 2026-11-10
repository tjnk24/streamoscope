import {RequestStateDto, RequestStatusEnum} from '__types/api/request';

export const checkPending = ({status}: RequestStateDto<unknown>) => status === RequestStatusEnum.Pending;
