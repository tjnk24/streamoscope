import {
    describe,
    expect,
    it,
} from 'vitest';

import {getConfiguredTargets} from '../getConfiguredTargets';

import {CONFIGURED_BRIDGE_DATA} from './consts';

describe('getConfiguredTargets', () => {
    it('takes the targets the bridge knows before they start and drops repeated fingerprints', () => {
        expect(getConfiguredTargets(CONFIGURED_BRIDGE_DATA).map(({id}) => id)).toEqual(['b7c20e11', '5d1e88b0']);
    });

    it('takes nothing without the bridge or from a bridge before 8', () => {
        const oldBridgeData = {...CONFIGURED_BRIDGE_DATA, configuredTargets: undefined};

        expect(getConfiguredTargets(null)).toEqual([]);
        expect(getConfiguredTargets(oldBridgeData)).toEqual([]);
    });

    it('skips a record without a fingerprint or a server', () => {
        const configuredTargets = [
            {
                id: 'b7c20e11',
                name: 'multi-output',
                server: 'rtmp://live.twitch.tv',
            },
            {
                name: 'multi-output',
                server: 'rtmp://live.youtube.com',
            },
            {
                id: '5d1e88b0',
                name: 'multi-output',
            },
        ];

        const bridgeData = JSON.parse(JSON.stringify({...CONFIGURED_BRIDGE_DATA, configuredTargets}));

        expect(getConfiguredTargets(bridgeData).map(({id}) => id)).toEqual(['b7c20e11']);
    });
});
