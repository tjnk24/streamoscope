import {ExclamationCircleFilled} from '@ant-design/icons';
import {Tooltip, Typography} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {journalService} from '__services/journal/journalService';
import {JournalLevelEnum} from '__types/journal';

import {actions} from '../../actions';
import {ADVICE_TEXTS} from '../../consts';

import {Props} from './types';

import style from './style.module.scss';

const AdviceIcon = ({advice}: Props) => {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const {t} = useTranslation();

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
            <ExclamationCircleFilled className={style.icon}/>
        </Tooltip>
    );
};

export default AdviceIcon;
