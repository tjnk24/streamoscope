export type ObsVersionDto = {
    obsVersion: string;
    obsWebSocketVersion: string;
    platformDescription: string;
    rpcVersion: number;
    availableRequests: string[];
};

export type ObsStatsDto = {
    activeFps: number;
    averageFrameRenderTime: number;
    cpuUsage: number;
    memoryUsage: number;
    availableDiskSpace: number;
    renderSkippedFrames: number;
    renderTotalFrames: number;
    outputSkippedFrames: number;
    outputTotalFrames: number;
};

export type ObsVideoSettingsDto = {
    fpsNumerator: number;
    fpsDenominator: number;
};

export type ObsProfileParameterDto = {
    parameterValue: string | null;
};

export type ObsSceneCollectionListDto = {
    currentSceneCollectionName: string;
    sceneCollections: string[];
};

type ObsStreamServiceSettingsDto = {
    service?: string;
    server?: string;
};

export type ObsStreamServiceDto = {
    streamServiceType: string;
    streamServiceSettings: ObsStreamServiceSettingsDto;
};

export type ObsOutputListItemDto = {
    outputName: string;
    outputKind: string;
    outputActive: boolean;
    outputFlags?: Record<string, boolean>;
};

export type ObsOutputListDto = {
    outputs: ObsOutputListItemDto[];
};

export type ObsOutputStatusDto = {
    outputActive: boolean;
    outputReconnecting: boolean;
    outputTimecode: string;
    outputDuration: number;
    outputCongestion: number;
    outputBytes: number;
    outputSkippedFrames: number;
    outputTotalFrames: number;
};
