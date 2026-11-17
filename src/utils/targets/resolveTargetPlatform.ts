import type {Nullable} from 'infrastructure/common';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

import {CardPlatformDto, SettingsDto} from '__types/app/settings';
import {
    PlatformSourceEnum,
    ResolvedPlatformDto,
    StreamTargetDto,
} from '__types/targets';
import {PLATFORM_RULES} from '__utils/consts';

const {User, TargetTitle} = PlatformSourceEnum;

export const resolveTargetPlatform = ({key, keyId, platform}: StreamTargetDto, cardPlatforms: SettingsDto['cardPlatforms']): ResolvedPlatformDto => {
    const {title, color, choices, guess} = platform;

    if (!choices.length) {
        return {
            title,
            color,
            choices,
            selected: null,
            source: null,
        };
    }

    const stored: Nullable<CardPlatformDto> = isPlainObject(cardPlatforms) && isPlainObject(cardPlatforms[key]) ? cardPlatforms[key] : null;
    const isSameKey = !isString(stored?.keyId) || keyId === null || stored.keyId === keyId;
    const userChoice = stored && isString(stored.platform) && choices.includes(stored.platform) && isSameKey ? stored.platform : null;
    const selected = userChoice ?? guess;
    const selectedRule = PLATFORM_RULES.find(rule => rule.title === selected);
    const guessSource = guess ? TargetTitle : null;

    return {
        title: selected ?? title,
        color: selectedRule?.color ?? color,
        choices,
        selected,
        source: userChoice ? User : guessSource,
    };
};
