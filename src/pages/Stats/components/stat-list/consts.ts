import {HealthLevelEnum} from '__types/stats/views';

import style from './style.module.scss';

const {Ok, Warn, Bad, Off} = HealthLevelEnum;

export const LEVEL_CLASS_NAMES: Record<HealthLevelEnum, string> = {
    [Ok]: style.ok,
    [Warn]: style.warn,
    [Bad]: style.bad,
    [Off]: style.off,
};
