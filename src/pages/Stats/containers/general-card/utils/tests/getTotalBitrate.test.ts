import {
    describe,
    expect,
    it,
} from 'vitest';

import {OFF_OUTPUT_VIEW} from '__utils/consts';

import {getTotalBitrate} from '../getTotalBitrate';

import {LIVE_OUTPUT} from './consts';

const TARGETS = [{key: 'main'}, {key: 'plugin:twitch'}, {key: 'plugin:goodgame'}];

describe('getTotalBitrate', () => {
    it('adds up the streams that are live', () => {
        const outputs = {
            main: LIVE_OUTPUT,
            'plugin:twitch': {...LIVE_OUTPUT, kbps: 3500.5},
            'plugin:goodgame': {...LIVE_OUTPUT, kbps: 2500},
        };

        expect(getTotalBitrate(TARGETS, outputs)).toEqual({kbps: 12000.5, liveCount: 3});
    });

    it('skips the streams that are off or unknown to the view', () => {
        const outputs = {
            main: LIVE_OUTPUT,
            'plugin:twitch': {...OFF_OUTPUT_VIEW, kbps: 3500},
        };

        expect(getTotalBitrate(TARGETS, outputs)).toEqual({kbps: 6000, liveCount: 1});
    });

    it('counts a live stream without a bitrate yet as live with zero', () => {
        const outputs = {
            main: LIVE_OUTPUT,
            'plugin:twitch': {...LIVE_OUTPUT, kbps: null},
        };

        expect(getTotalBitrate(TARGETS, outputs)).toEqual({kbps: 6000, liveCount: 2});
    });

    it('ignores outputs of targets that are gone', () => {
        const outputs = {
            main: LIVE_OUTPUT,
            'plugin:old': LIVE_OUTPUT,
        };

        expect(getTotalBitrate(TARGETS, outputs)).toEqual({kbps: 6000, liveCount: 1});
    });
});
