import {Progress, theme} from 'antd';
import clamp from 'lodash/clamp';

import {
    CONGESTION_BAD_SHARE,
    CONGESTION_WARN_SHARE,
    PROGRESS_SIZE,
} from './consts';
import {Props} from './types';
import {formatProgressPercent} from './utils/formatProgressPercent';

const CongestionProgress = ({value}: Props) => {
    const {token} = theme.useToken();

    const share = clamp(value || 0, 0, 1);

    const strokeColor = share < CONGESTION_WARN_SHARE
        ? token.colorSuccess
        : share < CONGESTION_BAD_SHARE
            ? token.colorWarning
            : token.colorError;

    return (
        <Progress
            percent={Math.round(share * 100)}
            status="normal"
            size={PROGRESS_SIZE}
            strokeColor={strokeColor}
            format={formatProgressPercent}
        />
    );
};

export default CongestionProgress;
