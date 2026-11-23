import {
    describe,
    expect,
    it,
} from 'vitest';

import {formatTimecode} from '../formatTimecode';

describe('formatTimecode', () => {
    it.each([
        {timecode: '00:00:13.533', text: '00:00:13'},
        {timecode: '01:02:03.000', text: '01:02:03'},
        {timecode: '00:00:08', text: '00:00:08'},
        {timecode: '', text: '—'},
    ])('$timecode is shown as $text', ({timecode, text}) => {
        expect(formatTimecode(timecode)).toBe(text);
    });
});
