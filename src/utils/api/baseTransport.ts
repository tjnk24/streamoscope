import ky from 'ky';

import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';

import {parseJsonBody} from './parseJsonBody';

export const baseTransport = ky.create({
    parseJson: parseJsonBody,
    hooks: {
        beforeError: [
            ({error}) => {
                journalService.log(JournalLevelEnum.Warn, 'api', error.message);

                return error;
            },
        ],
    },
});
