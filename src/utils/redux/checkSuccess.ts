import {RequestStateDto, RequestStatusEnum} from '__types/api/request';

export const checkSuccess = ({status}: RequestStateDto<unknown>) => status === RequestStatusEnum.Success;
