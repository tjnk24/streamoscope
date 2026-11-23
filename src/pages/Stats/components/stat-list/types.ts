import {ReactNode} from 'react';

import {HealthLevelEnum} from '__types/stats/views';

export type StatItemDto<StatKey extends string = string> = {
    key: StatKey;
    label: string;
    hint?: string;
    level?: HealthLevelEnum;
    value: ReactNode;
};

interface OwnProps {
    items: StatItemDto[];
    secondColumnStart?: number;
}

export type Props = OwnProps;
