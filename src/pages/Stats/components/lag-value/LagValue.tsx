import {useTranslation} from 'react-i18next';

import {formatNumber} from '../../utils/formatNumber';
import {formatPercent} from '../../utils/formatPercent';

import {Props} from './types';

import style from './style.module.scss';

const LagValue = ({lag}: Props) => {
    const {t} = useTranslation();

    const {skipped, total, recentSkipped} = lag;

    return (
        <>
            {`${formatNumber(skipped)} (${formatPercent(skipped, total)})`}

            {recentSkipped > 0 && (
                <span className={style.recentLag}>
                    {t('general.recentLag', {count: formatNumber(recentSkipped)})}
                </span>
            )}
        </>
    );
};

export default LagValue;
