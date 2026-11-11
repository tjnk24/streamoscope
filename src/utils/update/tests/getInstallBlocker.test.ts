import {
    describe,
    expect,
    it,
} from 'vitest';

import {UpdateStageEnum} from '__types/update/bridgeUpdate';
import {CompatibilityProblemEnum} from '__types/update/compatibility';
import {UpdateInstallBlockerEnum} from '__types/update/install';

import {getInstallBlocker} from '../getInstallBlocker';

import {
    BRIDGE_UPDATE_STATE,
    INSTALL_CONTEXT,
    RUNNING_UPDATE_STATUS,
} from './consts';

const {
    NoRelease,
    NotNewer,
    NoUpdater,
    Incompatible,
    InProgress,
} = UpdateInstallBlockerEnum;

describe('getInstallBlocker', () => {
    it('lets a newer compatible release install', () => {
        expect(getInstallBlocker(INSTALL_CONTEXT)).toBeNull();
    });

    it.each([
        ['there is no release', {release: null}, NoRelease],
        ['the release is the current version', {currentVersion: '0.2.0'}, NotNewer],
        ['the release is older', {currentVersion: '1.0.0'}, NotNewer],
        ['the bridge is missing', {bridge: null}, NoUpdater],
        ['the bridge has no updater', {bridge: {...BRIDGE_UPDATE_STATE, isAvailable: false}}, NoUpdater],
        ['the release does not fit OBS', {compatibility: {problems: [CompatibilityProblemEnum.ObsTooOld], warnings: []}}, Incompatible],
        ['an update is running', {bridge: {...BRIDGE_UPDATE_STATE, status: RUNNING_UPDATE_STATUS}}, InProgress],
    ])('refuses when %s', (_name, context, blocker) => {
        expect(getInstallBlocker({...INSTALL_CONTEXT, ...context})).toBe(blocker);
    });

    it('does not wait for an update status that stopped changing', () => {
        const staleStatus = {...RUNNING_UPDATE_STATUS, updated: RUNNING_UPDATE_STATUS.updated - 600};

        const context = {
            ...INSTALL_CONTEXT,
            bridge: {
                ...BRIDGE_UPDATE_STATE,
                status: staleStatus,
            },
        };

        expect(getInstallBlocker(context)).toBeNull();
    });

    it('lets a failed update be tried again', () => {
        const failedStatus = {...RUNNING_UPDATE_STATUS, stage: UpdateStageEnum.Failed, error: 'network'};

        const context = {
            ...INSTALL_CONTEXT,
            bridge: {
                ...BRIDGE_UPDATE_STATE,
                status: failedStatus,
            },
        };

        expect(getInstallBlocker(context)).toBeNull();
    });
});
