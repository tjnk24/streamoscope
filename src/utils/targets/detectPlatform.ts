import type {Nullable} from 'infrastructure/common';

import {PlatformDto} from '__types/targets';
import {
    PLATFORM_RULES,
    SHARED_PLATFORM_RULE,
    UNKNOWN_PLATFORM_COLOR,
} from '__utils/consts';

import {getServerHost} from './getServerHost';

export const detectPlatform = (service: Nullable<string>, server: Nullable<string>, targetTitle: Nullable<string>): PlatformDto => {
    const host = getServerHost(server);

    const rule = PLATFORM_RULES.find(({services, hosts}) => (
        (service && services.test(service)) || (host && hosts.some(pattern => pattern.test(host)))
    ));

    if (rule) {
        const {title, color} = rule;

        return {
            title,
            color,
            isKnown: true,
            choices: [],
            guess: null,
        };
    }

    if (host && SHARED_PLATFORM_RULE.hosts.some(pattern => pattern.test(host))) {
        const {title, color, choices} = SHARED_PLATFORM_RULE;

        const guesses = choices.filter(({targetTitlePattern, otherPlatformPattern}) => (
            targetTitle && targetTitlePattern.test(targetTitle) && !otherPlatformPattern?.test(targetTitle)
        ));

        return {
            title,
            color,
            isKnown: true,
            choices: choices.map(choice => choice.title),
            guess: guesses.length === 1 ? guesses[0].title : null,
        };
    }

    return {
        title: service || host || null,
        color: UNKNOWN_PLATFORM_COLOR,
        isKnown: false,
        choices: [],
        guess: null,
    };
};
