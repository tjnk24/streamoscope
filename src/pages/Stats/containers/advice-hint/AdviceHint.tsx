import {ExclamationCircleFilled} from '@ant-design/icons';
import {Tooltip, Typography} from 'antd';
import cn from 'classnames';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';

import {actions} from '../../actions';
import {ADVICE_TEXTS} from '../../consts';

import {Props} from './types';

import style from './style.module.scss';

const AdviceHint = ({advice, isShown, isHighlighted = true, children}: Props) => {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const {t} = useTranslation();

    if (!isShown) {
        return children;
    }

    const {textKey} = ADVICE_TEXTS[advice];

    const onWhatToDo = () => {
        journalService.log(JournalLevelEnum.Info, 'user', `opened the advice ${advice}`);

        setIsTooltipOpen(false);
        actions.adviceModal.setData({isVisible: true, advice});
    };

    return (
        <Tooltip
            classNames={{root: style.tooltip}}
            open={isTooltipOpen}
            title={(
                <>
                    {`${t(textKey)} `}

                    <Typography.Link
                        className={style.whatToDo}
                        onClick={onWhatToDo}
                    >
                        {t('advice.whatToDo')}
                    </Typography.Link>
                </>
            )}
            onOpenChange={setIsTooltipOpen}
        >
            <span className={cn(style.trigger, {[style.highlighted]: isHighlighted})}>
                <ExclamationCircleFilled className={style.icon}/>

                {children}
            </span>
        </Tooltip>
    );
};

export default AdviceHint;
