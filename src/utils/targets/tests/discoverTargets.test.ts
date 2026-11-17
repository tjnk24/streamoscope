import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {discoverTargets} from '../discoverTargets';

import {
    BRIDGE_NOW_MS,
    CONFIGURED_BRIDGE_PAIR,
    MAIN_KEY_CONFIGURED_BRIDGE_PAIR,
    MAIN_KEY_STARTED_BRIDGE_PAIR,
    MEASURED_BRIDGE_PAIR,
    OFFLINE_OUTPUTS_PAIR,
    OLD_BRIDGE_PAIR,
    PLUGIN_STREAM_PAIR,
    SERVICE_PAIR,
    SHORT_BRIDGE_PAIR,
    SHORT_CONFIGURED_BRIDGE_PAIR,
    STARTED_BRIDGE_PAIR,
    STARTED_PLUGINS_PAIR,
    THREE_PLUGIN_OUTPUTS_PAIR,
    WITHOUT_MAIN_KEY_BRIDGE_PAIR,
} from './consts';

describe('discoverTargets', () => {
    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(BRIDGE_NOW_MS);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('gives each output of the same name its own card, platform and key from the bridge', () => {
        const targets = discoverTargets([SERVICE_PAIR, THREE_PLUGIN_OUTPUTS_PAIR, MEASURED_BRIDGE_PAIR]);

        const plugins = targets
            ?.slice(1)
            .map(({key, outputId, platform, notes}) => ({key, outputId, title: platform.title, notes}));

        expect(targets?.[0]).toMatchObject({key: 'main', outputId: null});
        expect(plugins).toEqual([
            {
                key: 'plugin:a3f91c07',
                outputId: 'a3f91c07',
                title: 'GoodGame',
                notes: [],
            },
            {
                key: 'plugin:0f6d93aa',
                outputId: '0f6d93aa',
                title: 'Twitch',
                notes: [],
            },
            {
                key: 'plugin:b7c20e11',
                outputId: 'b7c20e11',
                title: 'Twitch',
                notes: [],
            },
        ]);
    });

    it('keeps one card with the warning when the bridge passes no statistics', () => {
        const targets = discoverTargets([SERVICE_PAIR, THREE_PLUGIN_OUTPUTS_PAIR, OLD_BRIDGE_PAIR]);

        expect(targets).toHaveLength(2);
        expect(targets?.[1]).toMatchObject({key: 'plugin:multi-output', outputId: null});
        expect(targets?.[1].notes).toHaveLength(1);
    });

    it('keeps one card with the warning when the bridge sees fewer outputs than OBS', () => {
        const targets = discoverTargets([SERVICE_PAIR, THREE_PLUGIN_OUTPUTS_PAIR, SHORT_BRIDGE_PAIR]);

        expect(targets?.map(({key}) => key)).toEqual(['main', 'plugin:multi-output']);
    });

    it('gives the targets the bridge knows a card before they start', () => {
        const targets = discoverTargets([SERVICE_PAIR, OFFLINE_OUTPUTS_PAIR, CONFIGURED_BRIDGE_PAIR]);

        const plugins = targets
            ?.slice(1)
            .map(({key, outputId, targetTitle, platform}) => ({key, outputId, targetTitle, title: platform.title}));

        expect(plugins).toEqual([
            {
                key: 'plugin:a3f91c07',
                outputId: 'a3f91c07',
                targetTitle: null,
                title: 'GoodGame',
            },
            {
                key: 'plugin:b7c20e11',
                outputId: 'b7c20e11',
                targetTitle: 'Main channel',
                title: 'Twitch',
            },
        ]);
    });

    it('fills the card of a target from its started output', () => {
        const targets = discoverTargets([SERVICE_PAIR, PLUGIN_STREAM_PAIR, SHORT_CONFIGURED_BRIDGE_PAIR]);

        expect(targets?.map(({key}) => key)).toEqual(['main', 'plugin:a3f91c07', 'plugin:b7c20e11']);
        expect(targets?.[2].targetTitle).toBe('Main channel');
    });

    it('adds outputs of other plugins after they start', () => {
        const targets = discoverTargets([SERVICE_PAIR, STARTED_PLUGINS_PAIR, STARTED_BRIDGE_PAIR]);

        expect(targets?.map(({key}) => key)).toEqual(['main', 'plugin:e27b6a90', 'plugin:a3f91c07', 'plugin:b7c20e11']);
    });

    it.each([
        ['before the target starts', OFFLINE_OUTPUTS_PAIR, MAIN_KEY_CONFIGURED_BRIDGE_PAIR],
        ['after the target starts', PLUGIN_STREAM_PAIR, MAIN_KEY_STARTED_BRIDGE_PAIR],
    ])('warns on the card of a target with the stream key of the main stream %s', (_case, outputsPair, bridgePair) => {
        const targets = discoverTargets([SERVICE_PAIR, outputsPair, bridgePair]);
        const noteTypes = targets?.map(({key, notes}) => ({key, types: notes.map(({type}) => type)}));

        expect(noteTypes).toEqual([
            {
                key: 'main',
                types: [],
            },
            {
                key: 'plugin:a3f91c07',
                types: [],
            },
            {
                key: 'plugin:b7c20e11',
                types: ['warning'],
            },
        ]);
    });

    it('does not warn without the key fingerprint of the main stream', () => {
        const targets = discoverTargets([SERVICE_PAIR, OFFLINE_OUTPUTS_PAIR, WITHOUT_MAIN_KEY_BRIDGE_PAIR]);

        expect(targets?.flatMap(({notes}) => notes)).toEqual([]);
    });

    it('keeps one card by name without the waiting targets when the bridge sees fewer outputs than OBS', () => {
        const targets = discoverTargets([SERVICE_PAIR, THREE_PLUGIN_OUTPUTS_PAIR, SHORT_CONFIGURED_BRIDGE_PAIR]);

        expect(targets?.map(({key}) => key)).toEqual(['main', 'plugin:multi-output']);
    });
});
