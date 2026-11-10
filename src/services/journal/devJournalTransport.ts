import {devApi} from '__api/dev/DevApi';
import {JournalTransportDto} from '__types/journal';

export const devJournalTransport: JournalTransportDto = {
    isReady: () => true,
    send: lines => {
        void devApi.sendJournal(lines.join('\n')).catch(() => undefined);
    },
    setEnabled: () => undefined,
    openFolder: () => {
        void devApi.openJournalFolder().catch(() => undefined);
    },
};
