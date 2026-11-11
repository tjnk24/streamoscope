import requirements from '../../../config/compatibility.json' with {type: 'json'};
import {VERSION} from '../consts.ts';

import {readNumberFromSource} from './readNumberFromSource.ts';
import {readRequiredRequests} from './readRequiredRequests.ts';

export const buildCompatibility = () => {
    const {minObsVersion, minChromiumVersion} = requirements;

    return {
        version: VERSION,
        minObsVersion,
        obsWebSocketRpcVersion: readNumberFromSource('src/utils/consts.ts', /OBS_RPC_VERSION\s*=\s*(\d+)/),
        minChromiumVersion,
        minBridgeVersion: readNumberFromSource('obs-script/streamoscope-bridge/consts.lua', /BRIDGE_VERSION\s*=\s*(\d+)/),
        requiredRequests: readRequiredRequests(),
    };
};
