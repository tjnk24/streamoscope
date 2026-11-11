import type {Nullable} from 'infrastructure/common';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

import {CompatibilityDto} from '__types/update/compatibility';

import {parseVersion} from './parseVersion';

export const parseCompatibility = (value: unknown): Nullable<CompatibilityDto> => {
    if (!isPlainObject(value)) {
        return null;
    }

    const data = value as Partial<Record<keyof CompatibilityDto, unknown>>;
    const {
        version,
        minObsVersion,
        obsWebSocketRpcVersion,
        minChromiumVersion,
        minBridgeVersion,
        requiredRequests,
    } = data;

    if (
        !isString(version) || !parseVersion(version)
        || !isString(minObsVersion) || !parseVersion(minObsVersion)
        || !isNumber(obsWebSocketRpcVersion)
        || !isNumber(minChromiumVersion)
        || !isNumber(minBridgeVersion)
        || !Array.isArray(requiredRequests) || !requiredRequests.every(isString)
    ) {
        return null;
    }

    return {
        version,
        minObsVersion,
        obsWebSocketRpcVersion,
        minChromiumVersion,
        minBridgeVersion,
        requiredRequests,
    };
};
