import {
    describe,
    expect,
    it,
} from 'vitest';

import {formatOutputTimecode} from '../formatOutputTimecode';

describe('formatOutputTimecode', () => {
    it.each([
        {seconds: 0, timecode: '00:00:00.000'},
        {seconds: 11, timecode: '00:00:11.000'},
        {seconds: 61.5, timecode: '00:01:01.500'},
        {seconds: 3599, timecode: '00:59:59.000'},
        {seconds: 3600, timecode: '01:00:00.000'},
        {seconds: 36_000 + 125, timecode: '10:02:05.000'},
    ])('$seconds s of a stream is $timecode', ({seconds, timecode}) => {
        expect(formatOutputTimecode(seconds)).toBe(timecode);
    });
});
