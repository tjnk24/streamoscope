import ky from 'ky';

import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';

export const baseTransport = ky.create({
    hooks: {
        beforeError: [
            ({error}) => {
                journalService.log(JournalLevelEnum.Warn, 'api', error.message);

                return error;
            },
        ],
    },
});
