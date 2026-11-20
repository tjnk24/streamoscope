import {ReactNode} from 'react';

import {AdviceEnum} from '__types/stats/views';

interface OwnProps {
    advice: AdviceEnum;
    isShown: boolean;
    isHighlighted?: boolean;
    children?: ReactNode;
}

export type Props = OwnProps;
