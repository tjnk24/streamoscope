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
    MEASURED_BRIDGE_PAIR,
    OLD_BRIDGE_PAIR,
    SERVICE_PAIR,
    SHORT_BRIDGE_PAIR,
    THREE_PLUGIN_OUTPUTS_PAIR,
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
});
