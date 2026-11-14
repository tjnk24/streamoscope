import {
    describe,
    expect,
    it,
} from 'vitest';

import {hasStreamOutput} from '../hasStreamOutput';

import {
    FAILED_OUTPUT_LIST_PAIR,
    MAIN_STREAM_PAIR,
    OFFLINE_OUTPUTS_PAIR,
    PLUGIN_STREAM_PAIR,
    STATS_PAIR,
} from './consts';

describe('hasStreamOutput', () => {
    it.each([
        ['a batch without the output list', [STATS_PAIR], false],
        ['a failed output list request', [FAILED_OUTPUT_LIST_PAIR], false],
        ['only recording and the virtual camera, before the first stream', [STATS_PAIR, OFFLINE_OUTPUTS_PAIR], false],
        ['the main stream output, kept after the first stream', [MAIN_STREAM_PAIR], true],
        ['a plugin stream output', [STATS_PAIR, PLUGIN_STREAM_PAIR], true],
    ])('answers for %s', (_name, pairs, isExpected) => {
        expect(hasStreamOutput(pairs)).toBe(isExpected);
    });
});
