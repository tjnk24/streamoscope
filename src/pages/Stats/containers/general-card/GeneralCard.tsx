import {CloseOutlined, ReloadOutlined} from '@ant-design/icons';
import {
    App,
    Card,
    Flex,
    NotificationArgsProps,
} from 'antd';
import {useTranslation} from 'react-i18next';

import {commonActions} from '__actions';
import EnhancedButton from '__components/EnhancedButton';
import EnhancedText from '__components/EnhancedText';
import {journalService} from '__services/journal/journalService';
import {obsConnectionService} from '__services/obsConnectionService';
import {JournalLevelEnum} from '__types/journal';

import StatList from '../../components/stat-list';

import {HIDDEN_NOTICE_DURATION_SEC, STAT_COLUMNS} from './consts';
import {useItems} from './hooks/useItems';

import style from './style.module.scss';

const GeneralCard = () => {
    const {t} = useTranslation();

    const {notification} = App.useApp();

    const items = useItems();

    const onReset = () => {
        journalService.log(JournalLevelEnum.Info, 'user', 'reset the stats');

        obsConnectionService.resetStats();
    };

    const onHide = () => {
        commonActions.settings.setIsShowGeneralCard(false);

        const hiddenNotice: NotificationArgsProps = {
            title: t('general.hiddenTitle'),
            description: t('general.hiddenText'),
            placement: 'bottomRight',
            duration: HIDDEN_NOTICE_DURATION_SEC,
        };

        notification.info(hiddenNotice);
    };

    return (
        <Card
            size="small"
            title={(
                <EnhancedText>
                    {t('general.title')}
                </EnhancedText>
            )}
            extra={(
                <EnhancedButton
                    buttonProps={{
                        type: 'text',
                        size: 'small',
                        icon: <CloseOutlined/>,
                        'aria-label': t('general.hide'),
                        onClick: onHide,
                    }}
                    withSpinner={false}
                />
            )}
        >
            <StatList
                items={items}
                column={STAT_COLUMNS}
            />

            <Flex
                className={style.actions}
                justify="end"
            >
                <EnhancedButton
                    buttonProps={{
                        size: 'small',
                        icon: <ReloadOutlined/>,
                        onClick: onReset,
                    }}
                    withSpinner={false}
                >
                    {t('general.reset')}
                </EnhancedButton>
            </Flex>
        </Card>
    );
};

export default GeneralCard;
