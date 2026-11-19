import {MULTI_RTMP_PATH_PREFIX, MEDIAMTX_PATHS_URL} from '../../../consts.ts';
import type {RtmpPathsDto} from '../../../types/rtmp.ts';

export const countReadyPluginPaths = async () => {
    const {items} = await (await fetch(MEDIAMTX_PATHS_URL)).json() as RtmpPathsDto;

    return items.filter(({name, ready}) => ready && name.startsWith(MULTI_RTMP_PATH_PREFIX)).length;
};
