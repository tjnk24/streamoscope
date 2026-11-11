import type {Nullable} from 'infrastructure/common';

import {PlatformDto} from '__types/targets';
import {PLATFORM_RULES, UNKNOWN_PLATFORM_COLOR} from '__utils/consts';

import {getServerHost} from './getServerHost';

export const detectPlatform = (service: Nullable<string>, server: Nullable<string>, fallbackTitle: string): PlatformDto => {
    const host = getServerHost(server);

    const rule = PLATFORM_RULES.find(({services, hosts}) => (
        (service && services.test(service)) || (host && hosts.some(pattern => pattern.test(host)))
    ));

    if (rule) {
        const {title, color} = rule;

        return {title, color, isKnown: true};
    }

    return {title: service || host || fallbackTitle, color: UNKNOWN_PLATFORM_COLOR, isKnown: false};
};
