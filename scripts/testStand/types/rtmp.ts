type RtmpPathDto = {
    name: string;
    ready: boolean;
};

export type RtmpPathsDto = {
    items: RtmpPathDto[];
};

type MultiRtmpServiceDto = {
    server: string;
    key: string;
};

type MultiRtmpTargetDto = {
    'id': string;
    'name': string;
    'enabled': boolean;
    'sync-start': boolean;
    'sync-stop': boolean;
    'protocol': string;
    'service-param': MultiRtmpServiceDto;
    'video-config': string;
};

export type MultiRtmpVideoParamDto = {
    bitrate: number;
    rate_control: string;
    preset: string;
    keyint_sec: number;
};

type MultiRtmpVideoConfigDto = {
    id: string;
    encoder: string;
    param: MultiRtmpVideoParamDto;
};

export type MultiRtmpConfigDto = {
    targets: MultiRtmpTargetDto[];
    video_configs: MultiRtmpVideoConfigDto[];
};

type MultiRtmpReleaseAssetDto = {
    name: string;
    size: number;
    digest: string | null;
};

export type MultiRtmpReleaseDto = {
    tag_name: string;
    html_url: string;
    assets: MultiRtmpReleaseAssetDto[];
};
