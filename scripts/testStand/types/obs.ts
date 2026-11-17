export type ObsWebSocketConfigDto = {
    server_password: string;
    server_port: number;
};

export type ObsAuthenticationDto = {
    salt: string;
    challenge: string;
};

type ObsRequestStatusDto = {
    result: boolean;
    code: number;
    comment?: string;
};

type ObsMessageDataDto = {
    authentication?: ObsAuthenticationDto;
    requestStatus?: ObsRequestStatusDto;
    responseData?: Record<string, unknown>;
};

export type ObsMessageDto = {
    op: number;
    d: ObsMessageDataDto;
};

type BridgeOutputDto = {
    name: string;
    id?: string;
    keyId?: string;
    stats?: Record<string, unknown>;
};

type BridgeConfiguredTargetDto = {
    id: string;
    keyId?: string;
    title?: string;
};

export type BridgeDataDto = {
    outputs: BridgeOutputDto[];
    configuredTargets?: BridgeConfiguredTargetDto[];
    mainKeyId?: string;
};
