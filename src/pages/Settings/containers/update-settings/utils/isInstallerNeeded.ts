import type {Nullable} from 'infrastructure/common';

import {BridgeUpdateStateDto} from '__types/update/bridgeUpdate';
import {STUB_MIN_BRIDGE_VERSION} from '__utils/consts';

export const isInstallerNeeded = (bridge: Nullable<BridgeUpdateStateDto>): boolean => (
    bridge !== null
    && bridge.isAvailable
    && bridge.bridgeVersion >= STUB_MIN_BRIDGE_VERSION
    && bridge.stubVersion === null
);
