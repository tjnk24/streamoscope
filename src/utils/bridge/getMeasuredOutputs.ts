import type {Nullable} from 'infrastructure/common';
import countBy from 'lodash/countBy';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import {BridgeDataDto, MeasuredBridgeOutputDto} from '__types/bridge';

export const getMeasuredOutputs = (bridgeData: Nullable<BridgeDataDto>): MeasuredBridgeOutputDto[] => {
    if (!bridgeData || !isNumber(bridgeData.sampledAtMs)) {
        return [];
    }

    const measuredOutputs = bridgeData.outputs.filter((output): output is MeasuredBridgeOutputDto => isString(output.id) && Boolean(output.stats));
    const idCounts = countBy(measuredOutputs, 'id');

    return measuredOutputs.filter(({id}) => idCounts[id] === 1);
};
