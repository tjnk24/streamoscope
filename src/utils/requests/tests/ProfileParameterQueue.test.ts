import {
    describe,
    expect,
    it,
} from 'vitest';

import {JOURNAL_LINES_PARAMETER, UPDATE_COMMAND_PARAMETER} from '__utils/consts';

import {ProfileParameterQueue} from '../ProfileParameterQueue';

import {
    AUTO_UPDATE_COMMAND,
    AUTO_UPDATE_REQUEST,
    HEALTHY_COMMAND,
    HEALTHY_REQUEST,
    INSTALL_COMMAND,
    INSTALL_REQUEST,
    JOURNAL_LINES,
    JOURNAL_LINES_REQUEST,
} from './consts';

describe('ProfileParameterQueue', () => {
    it('sends the first write at once', () => {
        const queue = new ProfileParameterQueue();

        queue.push(UPDATE_COMMAND_PARAMETER, INSTALL_COMMAND);

        expect(queue.takeDue(0)).toEqual([INSTALL_REQUEST]);
        expect(queue.takeDue(100)).toEqual([]);
    });

    it('holds the next write to the same parameter until the bridge has read the previous one', () => {
        const queue = new ProfileParameterQueue();

        queue.push(UPDATE_COMMAND_PARAMETER, HEALTHY_COMMAND);
        queue.takeDue(0);
        queue.push(UPDATE_COMMAND_PARAMETER, INSTALL_COMMAND);

        expect(queue.takeDue(749)).toEqual([]);
        expect(queue.takeDue(750)).toEqual([INSTALL_REQUEST]);
    });

    it('sends waiting writes one per poll in the order they came', () => {
        const queue = new ProfileParameterQueue();

        queue.push(UPDATE_COMMAND_PARAMETER, AUTO_UPDATE_COMMAND);
        queue.push(UPDATE_COMMAND_PARAMETER, HEALTHY_COMMAND);
        queue.push(UPDATE_COMMAND_PARAMETER, INSTALL_COMMAND);

        expect(queue.takeDue(0)).toEqual([AUTO_UPDATE_REQUEST]);
        expect(queue.takeDue(1000)).toEqual([HEALTHY_REQUEST]);
        expect(queue.takeDue(2000)).toEqual([INSTALL_REQUEST]);
        expect(queue.takeDue(3000)).toEqual([]);
    });

    it('does not hold writes to different parameters', () => {
        const queue = new ProfileParameterQueue();

        queue.push(UPDATE_COMMAND_PARAMETER, INSTALL_COMMAND);
        queue.push(JOURNAL_LINES_PARAMETER, JOURNAL_LINES);

        expect(queue.takeDue(0)).toEqual([INSTALL_REQUEST, JOURNAL_LINES_REQUEST]);
    });

    it('drops waiting writes when the connection is lost', () => {
        const queue = new ProfileParameterQueue();

        queue.push(UPDATE_COMMAND_PARAMETER, HEALTHY_COMMAND);
        queue.takeDue(0);
        queue.push(UPDATE_COMMAND_PARAMETER, INSTALL_COMMAND);
        queue.clear();

        expect(queue.takeDue(1000)).toEqual([]);
    });
});
