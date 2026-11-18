import {
    describe,
    expect,
    it,
} from 'vitest';

import {ensureContrast} from '../ensureContrast';
import {getContrastRatio} from '../getContrastRatio';
import {mixColors} from '../mixColors';

describe('mixColors', () => {
    it('mixes two colors by weight', () => {
        expect(mixColors('#000000', '#ffffff', 0.5)).toBe('#808080');
        expect(mixColors('#272a33', '#3c404d', 0)).toBe('#272a33');
        expect(mixColors('#272a33', '#3c404d', 1)).toBe('#3c404d');
    });
});

describe('getContrastRatio', () => {
    it('gives the WCAG contrast ratio in any order', () => {
        expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
        expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
        expect(getContrastRatio('#272a33', '#272a33')).toBeCloseTo(1);
    });
});

describe('ensureContrast', () => {
    it('keeps a color that is readable already', () => {
        expect(ensureContrast('#ffffff', '#272a33', 4.5)).toBe('#ffffff');
    });

    it.each([
        ['the dark accent of Acri on its dark card', '#131a30', '#181819'],
        ['the pale accent of Light on its light card', '#8cb5ff', '#e5e5e5'],
        ['a neon platform color on a light card', '#53fc18', '#e5e5e5'],
    ])('makes %s readable', (_case, color, background) => {
        expect(getContrastRatio(ensureContrast(color, background, 3), background)).toBeGreaterThanOrEqual(3);
    });

    it('lightens on a dark background and darkens on a light one', () => {
        expect(getContrastRatio(ensureContrast('#131a30', '#181819', 3), '#ffffff')).toBeLessThan(getContrastRatio('#131a30', '#ffffff'));
        expect(getContrastRatio(ensureContrast('#8cb5ff', '#e5e5e5', 3), '#000000')).toBeLessThan(getContrastRatio('#8cb5ff', '#000000'));
    });
});
