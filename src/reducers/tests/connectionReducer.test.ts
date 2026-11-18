import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import connectionSlice from '../connectionReducer';

describe('connectionReducer', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('starts with the theme the bridge wrote next to the dock page', () => {
        const colors = {window: '#d3d3d3', base: '#e5e5e5', text: '#0a0a0a'};

        vi.stubGlobal('window', {STREAMOSCOPE_OBS_THEME: {id: 'com.obsproject.Yami.Light', isDark: false, colors}});

        const {obsTheme} = connectionSlice.getInitialState();

        expect(obsTheme?.isDark).toBe(false);
        expect(obsTheme?.colors.base).toBe('#e5e5e5');
    });

    it('starts without a theme when there is neither the file nor a saved theme', () => {
        vi.stubGlobal('window', {});

        expect(connectionSlice.getInitialState().obsTheme).toBeNull();
    });
});
