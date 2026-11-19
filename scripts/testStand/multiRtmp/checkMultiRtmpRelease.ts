import {
    MULTI_RTMP_ARCHIVE,
    MULTI_RTMP_LATEST_RELEASE_URL,
    MULTI_RTMP_VERSION,
} from '../consts.ts';
import type {MultiRtmpReleaseDto} from '../types/rtmp.ts';

export const checkMultiRtmpRelease = async () => {
    const response = await fetch(MULTI_RTMP_LATEST_RELEASE_URL);

    if (!response.ok) {
        throw new Error(`Asking GitHub for the latest obs-multi-rtmp release failed: HTTP ${response.status}`);
    }

    const {tag_name: latestVersion, html_url: releaseUrl, assets} = await response.json() as MultiRtmpReleaseDto;

    if (latestVersion === MULTI_RTMP_VERSION) {
        console.log(`ok   the stand pins obs-multi-rtmp ${MULTI_RTMP_VERSION}, the latest release`);

        return;
    }

    const archiveName = MULTI_RTMP_ARCHIVE.name.replaceAll(MULTI_RTMP_VERSION, latestVersion);
    const archive = assets.find(({name}) => name === archiveName);

    const archiveText = archive
        ? `${archive.size} bytes, ${archive.digest ?? 'no digest'}`
        : 'not in the release';

    console.log(`WARNING obs-multi-rtmp ${latestVersion} is out, the stand pins ${MULTI_RTMP_VERSION}: ${releaseUrl}`);
    console.log(`        ${archiveName}: ${archiveText}`);
    console.log('        raise MULTI_RTMP_VERSION and the SHA-256 of MULTI_RTMP_ARCHIVE in scripts/testStand/consts.ts and run npm run test:stand');
    process.exitCode = 1;
};
