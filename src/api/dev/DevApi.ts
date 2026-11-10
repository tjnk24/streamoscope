import {DEV_ROUTES} from '__routes/api/dev';
import {DevObsConnectionDto} from '__types/connection/DevObsConnectionDto';
import {BaseApi} from '__utils/api/BaseApi';

import {devTransport} from './transport/devTransport';

class DevApi extends BaseApi {
    constructor() {
        super(devTransport);
    }

    getObsConnection = () =>
        this.get<DevObsConnectionDto>(DEV_ROUTES.OBS_CONNECTION);

    sendJournal = (body: string) =>
        this.post(DEV_ROUTES.JOURNAL.INDEX, {body});

    openJournalFolder = () =>
        this.post(DEV_ROUTES.JOURNAL.OPEN_FOLDER);
}

export const devApi = /*#__PURE__*/ new DevApi();
