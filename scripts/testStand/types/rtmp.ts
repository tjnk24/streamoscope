type RtmpPathDto = {
    name: string;
    ready: boolean;
};

export type RtmpPathsDto = {
    items: RtmpPathDto[];
};

type FakeMultiRtmpServiceDto = {
    server: string;
    key: string;
};

type FakeMultiRtmpTargetDto = {
    'id': string;
    'name': string;
    'enabled': boolean;
    'protocol': string;
    'service-param': FakeMultiRtmpServiceDto;
    'video-config': string;
};

type FakeMultiRtmpVideoParamDto = {
    bitrate: number;
};

type FakeMultiRtmpVideoConfigDto = {
    id: string;
    param: FakeMultiRtmpVideoParamDto;
};

export type FakeMultiRtmpConfigDto = {
    targets: FakeMultiRtmpTargetDto[];
    video_configs: FakeMultiRtmpVideoConfigDto[];
};
