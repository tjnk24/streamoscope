import {ReloadOutlined} from '@ant-design/icons';
import {Card, Flex} from 'antd';
import {useTranslation} from 'react-i18next';

import EnhancedButton from '__components/EnhancedButton';
import EnhancedText from '__components/EnhancedText';
import {journalService} from '__services/journal/journalService';
import {obsConnectionService} from '__services/obsConnectionService';
import {JournalLevelEnum} from '__types/journal';

import StatList from '../../components/stat-list';

import {COMPUTER_STAT_KEYS} from './consts';
import {useItems} from './hooks/useItems';

import style from './style.module.scss';

const GeneralCard = () => {
    const {t} = useTranslation();

    const items = useItems();

    const computerRowIndex = items.findIndex(({key}) => COMPUTER_STAT_KEYS.includes(key));

    const secondColumnStart = computerRowIndex >= 0 ? computerRowIndex : undefined;

    const onReset = () => {
        journalService.log(JournalLevelEnum.Info, 'user', 'reset the stats');

        obsConnectionService.resetStats();
    };

    return (
        <Card
            data-testid="general-card"
            size="small"
            title={(
                <EnhancedText>
                    {t('general.title')}
                </EnhancedText>
            )}
        >
            {items.length > 0 && (
                <StatList
                    items={items}
                    secondColumnStart={secondColumnStart}
                />
            )}

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
