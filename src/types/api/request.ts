import type {Nullable} from 'infrastructure/common';

export enum RequestStatusEnum {
    Pending = 'pending',
    Success = 'success',
    Failed = 'failed',
}

export type RequestStateDto<Data> = {
    status: Nullable<RequestStatusEnum>;
    data: Nullable<Data>;
    error: Nullable<string>;
};

export type RequestActionsDto<Data> = {
    pending: () => unknown;
    success: (data: Data) => unknown;
    failed: (error: string) => unknown;
};
