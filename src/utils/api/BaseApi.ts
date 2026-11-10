import type {KyInstance, Options} from 'ky';

export abstract class BaseApi {
    constructor(protected readonly transport: KyInstance) {}

    protected get = <Result>(endpoint: string, options?: Options) =>
        this.transport
            .get(endpoint, options)
            .json<Result>();

    protected query = <Result>(endpoint: string, options?: Options) =>
        this.transport
            .query(endpoint, options)
            .json<Result>();

    protected post = <Result = null>(endpoint: string, options?: Options) =>
        this.transport
            .post(endpoint, options)
            .json<Result>();

    protected put = <Result = null>(endpoint: string, options?: Options) =>
        this.transport
            .put(endpoint, options)
            .json<Result>();

    protected patch = <Result = null>(endpoint: string, options?: Options) =>
        this.transport
            .patch(endpoint, options)
            .json<Result>();

    protected delete = <Result = null>(endpoint: string, options?: Options) =>
        this.transport
            .delete(endpoint, options)
            .json<Result>();

    protected head = (endpoint: string, options?: Options) =>
        this.transport.head(endpoint, options);
}
