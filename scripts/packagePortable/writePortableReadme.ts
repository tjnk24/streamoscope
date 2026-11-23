import fs from 'node:fs';
import path from 'node:path';

import {VERSION} from '../packageRelease/consts.ts';

import {PORTABLE_DIRECTORY, PORTABLE_README_TEMPLATE_PATH} from './consts.ts';

export const writePortableReadme = () => {
    const readme = fs.readFileSync(PORTABLE_README_TEMPLATE_PATH, 'utf8')
        .replaceAll('{{version}}', VERSION)
        .replace(/\r?\n/g, '\r\n');

    fs.writeFileSync(path.join(PORTABLE_DIRECTORY, 'README.txt'), readme);
};
