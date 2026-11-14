import {
    describe,
    expect,
    it,
} from 'vitest';

import {getDockAddress} from '../getDockAddress';

describe('getDockAddress', () => {
    it.each([
        {
            name: 'skips the version folder, which disappears after updates',
            href: 'file:///C:/Users/Ivan/AppData/Local/Programs/streamoscope/versions/0.6.0/dock/index.html#/settings',
            address: 'file:///C:/Users/Ivan/AppData/Local/Programs/streamoscope/dock/index.html',
        },
        {
            name: 'keeps a manual install as it is',
            href: 'file:///D:/obs/streamoscope/dock/index.html#/settings',
            address: 'file:///D:/obs/streamoscope/dock/index.html',
        },
        {
            name: 'shows a Cyrillic path readably',
            href: 'file:///C:/Users/%D0%98%D0%B2%D0%B0%D0%BD/streamoscope/versions/1.2.3/dock/index.html',
            address: 'file:///C:/Users/Иван/streamoscope/dock/index.html',
        },
        {
            name: 'gives the development server address',
            href: 'http://localhost:3062/#/settings',
            address: 'http://localhost:3062/',
        },
    ])('$name', ({href, address}) => {
        expect(getDockAddress(href)).toBe(address);
    });
});
