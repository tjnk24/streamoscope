import fs from 'node:fs';

import {DEV_JOURNAL_DIRECTORY} from '../../../consts.ts';

export const clearDevJournal = () => {
    fs.rmSync(DEV_JOURNAL_DIRECTORY, {recursive: true, force: true});
    fs.mkdirSync(DEV_JOURNAL_DIRECTORY, {recursive: true});
};
