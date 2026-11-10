import type {KyInstance, Options} from 'ky';

export abstract class BaseApi {
    constructor(protected readonly transport: KyInstance) {}

    protected get = <Result>(endpoint: string, options?: Options) =>
        this.transport
            .get(endpoint, options)
            .json<Result>();
}
