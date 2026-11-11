import {
    describe,
    expect,
    it,
} from 'vitest';

import {ReleaseNotesModeEnum} from '../../../../types';
import {filterReleaseNotes} from '../filterReleaseNotes';

import {RELEASES} from './consts';

const {Current, Newer} = ReleaseNotesModeEnum;

describe('filterReleaseNotes', () => {
    it('takes only the installed version for its own link', () => {
        expect(filterReleaseNotes(RELEASES, Current, '0.5.1').map(({version}) => version)).toEqual(['0.5.1']);
    });

    it('takes every newer version, newest first, for the link next to Update', () => {
        expect(filterReleaseNotes(RELEASES, Newer, '0.5.1').map(({version}) => version)).toEqual(['0.7.0', '0.6.0']);
    });

    it('finds nothing for a version that has not been released', () => {
        expect(filterReleaseNotes(RELEASES, Current, '0.8.0')).toEqual([]);
    });
});
