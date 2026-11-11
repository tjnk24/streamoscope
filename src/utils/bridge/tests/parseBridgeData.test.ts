import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {parseBridgeData} from '../parseBridgeData';

import {
    BRIDGE_PARAMETER,
    BRIDGE_PARAMETER_WITHOUT_OUTPUTS,
    BRIDGE_PARAMETER_WITHOUT_TIME,
    BRIDGE_PUBLISHED_AT,
    BRIDGE_SCENE_COLLECTION,
    OLD_BRIDGE_PARAMETER,
} from './consts';

describe('parseBridgeData', () => {
    beforeAll(() => {
        vi.setSystemTime((BRIDGE_PUBLISHED_AT + 2) * 1000);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('reads fresh data', () => {
        expect(parseBridgeData(BRIDGE_PARAMETER)?.updated).toBe(BRIDGE_PUBLISHED_AT);
    });

    it('drops data older than the stale limit', () => {
        vi.setSystemTime((BRIDGE_PUBLISHED_AT + 60) * 1000);

        expect(parseBridgeData(BRIDGE_PARAMETER)).toBeNull();

        vi.setSystemTime((BRIDGE_PUBLISHED_AT + 2) * 1000);
    });

    it('drops data the bridge of another scene collection left', () => {
        expect(parseBridgeData(BRIDGE_PARAMETER, 'Other scenes')).toBeNull();
    });

    it('keeps data of the current scene collection', () => {
        expect(parseBridgeData(BRIDGE_PARAMETER, BRIDGE_SCENE_COLLECTION)).not.toBeNull();
    });

    it('keeps data of a bridge that does not report its scene collection', () => {
        expect(parseBridgeData(OLD_BRIDGE_PARAMETER, 'Other scenes')).not.toBeNull();
    });

    it('drops an empty or broken parameter', () => {
        expect(parseBridgeData(null)).toBeNull();
        expect(parseBridgeData({parameterValue: 'not json'})).toBeNull();
        expect(parseBridgeData({parameterValue: 'null'})).toBeNull();
        expect(parseBridgeData(BRIDGE_PARAMETER_WITHOUT_TIME)).toBeNull();
        expect(parseBridgeData(BRIDGE_PARAMETER_WITHOUT_OUTPUTS)).toBeNull();
    });
});
