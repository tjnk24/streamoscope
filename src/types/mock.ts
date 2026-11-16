export type MockOutputStateDto = {
    bytes: number;
    totalFrames: number;
    skippedFrames: number;
    startedAt: number;
};

export type MockTargetDto = {
    outputName: string;
    outputId: string;
    server: string;
    minKbps: number;
    maxKbps: number;
};
