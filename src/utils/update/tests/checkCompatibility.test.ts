import {
    describe,
    expect,
    it,
} from 'vitest';

import {CompatibilityProblemEnum, CompatibilityWarningEnum} from '__types/update/compatibility';

import {checkCompatibility} from '../checkCompatibility';

import {COMPATIBILITY, ENVIRONMENT} from './consts';

const {ObsTooOld, RpcMismatch, RequestsMissing, ChromiumTooOld} = CompatibilityProblemEnum;

const {MajorUpdate} = CompatibilityWarningEnum;

describe('checkCompatibility', () => {
    it('finds nothing when everything fits', () => {
        expect(checkCompatibility(COMPATIBILITY, ENVIRONMENT)).toEqual({problems: [], warnings: []});
    });

    it.each([
        ['OBS is too old', {obsVersion: '29.1.3'}, ObsTooOld],
        ['the obs-websocket protocol differs', {rpcVersion: 2}, RpcMismatch],
        ['obs-websocket lacks a request', {availableRequests: ['GetStats']}, RequestsMissing],
        ['the OBS browser is too old', {chromiumVersion: 103}, ChromiumTooOld],
    ])('blocks the update when %s', (_name, environment, problem) => {
        expect(checkCompatibility(COMPATIBILITY, {...ENVIRONMENT, ...environment}).problems).toEqual([problem]);
    });

    it('accepts the minimum OBS version itself', () => {
        expect(checkCompatibility(COMPATIBILITY, {...ENVIRONMENT, obsVersion: '30.0.0'}).problems).toEqual([]);
    });

    it('skips checks it has no data for', () => {
        const unknown = {...ENVIRONMENT, obsVersion: null, rpcVersion: null, availableRequests: null, chromiumVersion: null};

        expect(checkCompatibility(COMPATIBILITY, unknown)).toEqual({problems: [], warnings: []});
    });

    it('warns about a major update', () => {
        expect(checkCompatibility({...COMPATIBILITY, version: '1.0.0'}, ENVIRONMENT).warnings).toEqual([MajorUpdate]);
        expect(checkCompatibility({...COMPATIBILITY, version: '20.1.0'}, ENVIRONMENT).warnings).toEqual([MajorUpdate]);
    });
});
