type RtmpPathDto = {
    name: string;
    ready: boolean;
};

export type RtmpPathsDto = {
    items: RtmpPathDto[];
};

type FakeMultiRtmpTargetDto = {
    bitrate: number;
};

export type FakeMultiRtmpSettingsDto = {
    server: string;
    keyPrefix: string;
    targets: FakeMultiRtmpTargetDto[];
};
