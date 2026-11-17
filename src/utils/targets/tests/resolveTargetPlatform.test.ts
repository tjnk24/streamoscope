import {
    describe,
    expect,
    it,
} from 'vitest';

import {SettingsDto} from '__types/app/settings';
import {PlatformSourceEnum} from '__types/targets';

import {resolveTargetPlatform} from '../resolveTargetPlatform';

import {BOOSTY_CHOICE, SHARED_TARGET} from './consts';

const {User, TargetTitle} = PlatformSourceEnum;

describe('resolveTargetPlatform', () => {
    it('asks when there is neither a choice nor a guess', () => {
        expect(resolveTargetPlatform(SHARED_TARGET, {})).toMatchObject({
            title: 'VK/OK/Boosty',
            color: '#2787f5',
            selected: null,
            source: null,
        });
    });

    it('takes the guess from the target name', () => {
        const guessedTarget = {
            ...SHARED_TARGET,
            platform: {...SHARED_TARGET.platform, guess: 'OK'},
        };

        expect(resolveTargetPlatform(guessedTarget, {})).toMatchObject({
            title: 'OK',
            color: '#ff7700',
            selected: 'OK',
            source: TargetTitle,
        });
    });

    it('lets the choice of the user win over the guess', () => {
        const guessedTarget = {
            ...SHARED_TARGET,
            platform: {...SHARED_TARGET.platform, guess: 'OK'},
        };

        const cardPlatforms = {[SHARED_TARGET.key]: BOOSTY_CHOICE};

        expect(resolveTargetPlatform(guessedTarget, cardPlatforms)).toMatchObject({
            title: 'Boosty',
            color: '#f15f2c',
            selected: 'Boosty',
            source: User,
        });
    });

    it('drops the choice when the stream key changed', () => {
        const changedKeyTarget = {...SHARED_TARGET, keyId: '0b1e2f3a'};

        const cardPlatforms = {[SHARED_TARGET.key]: BOOSTY_CHOICE};

        expect(resolveTargetPlatform(changedKeyTarget, cardPlatforms)).toMatchObject({selected: null, source: null});
    });

    it.each([
        ['the card does not know its key', {...SHARED_TARGET, keyId: null}, BOOSTY_CHOICE],
        ['the choice was made without the key', SHARED_TARGET, {...BOOSTY_CHOICE, keyId: null}],
    ])('keeps the choice when %s', (_case, target, choice) => {
        expect(resolveTargetPlatform(target, {[target.key]: choice})).toMatchObject({selected: 'Boosty', source: User});
    });

    it.each([
        ['a platform outside the choices', {[SHARED_TARGET.key]: {...BOOSTY_CHOICE, platform: 'Twitch'}}],
        ['a choice that is not an object', {[SHARED_TARGET.key]: 'Boosty'}],
        ['a platform that is not a string', {[SHARED_TARGET.key]: {...BOOSTY_CHOICE, platform: 5}}],
        ['choices that are not an object', 'Boosty'],
    ])('skips %s', (_case, cardPlatforms) => {
        const storedPlatforms = cardPlatforms as unknown as SettingsDto['cardPlatforms'];

        expect(resolveTargetPlatform(SHARED_TARGET, storedPlatforms)).toMatchObject({selected: null, source: null});
    });

    it('leaves a card off the shared servers as detected', () => {
        const twitchTarget = {
            ...SHARED_TARGET,
            platform: {
                title: 'Twitch',
                color: '#a970ff',
                isKnown: true,
                choices: [],
                guess: null,
            },
        };

        const cardPlatforms = {[SHARED_TARGET.key]: BOOSTY_CHOICE};

        expect(resolveTargetPlatform(twitchTarget, cardPlatforms)).toEqual({
            title: 'Twitch',
            color: '#a970ff',
            choices: [],
            selected: null,
            source: null,
        });
    });
});
