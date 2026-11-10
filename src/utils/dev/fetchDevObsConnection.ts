import type {Nullable} from 'infrastructure/common';

import {devApi} from '__api/dev/DevApi';
import {DevObsConnectionDto} from '__types/connection/DevObsConnectionDto';

export const fetchDevObsConnection = async (): Promise<Nullable<DevObsConnectionDto>> => {
    try {
        return await devApi.getObsConnection();
    } catch {
        return null;
    }
};
