import type {Nullable} from 'infrastructure/common';
import countBy from 'lodash/countBy';
import isString from 'lodash/isString';

import {BridgeConfiguredTargetDto, BridgeDataDto} from '__types/bridge';

export const getConfiguredTargets = (bridgeData: Nullable<BridgeDataDto>): BridgeConfiguredTargetDto[] => {
    if (!bridgeData || !Array.isArray(bridgeData.configuredTargets)) {
        return [];
    }

    const configuredTargets = bridgeData.configuredTargets.filter(({id, name, server}) => isString(id) && isString(name) && isString(server));
    const idCounts = countBy(configuredTargets, 'id');

    return configuredTargets.filter(({id}) => idCounts[id] === 1);
};
