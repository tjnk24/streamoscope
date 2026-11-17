import {ApiOutlined, LoadingOutlined} from '@ant-design/icons';
import {
    Alert,
    Card,
    Empty,
    Flex,
} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsIsShowGeneralCardSelector, settingsIsShowOutputCardsSelector} from '__selectors/settingsSelectors';
import {statsHasStreamStartedSelector, statsTargetsSelector} from '__selectors/statsSelectors';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {OutputOriginEnum} from '__types/targets';

import {adviceModalSelector} from '../../selectors/adviceModalSelectors';
import AdviceModal from '../advice-modal';
import CardGrid from '../card-grid';
import GeneralCard from '../general-card';

import {useConnectionAlertView} from './hooks/useConnectionAlertView';

import style from './style.module.scss';

const Page = () => {
    const status = useSelector(connectionStatusSelector);
    const isShowOutputCards = useSelector(settingsIsShowOutputCardsSelector);
    const isShowGeneralCard = useSelector(settingsIsShowGeneralCardSelector);
    const {isVisible: isAdviceModalVisible} = useSelector(adviceModalSelector);
    const hasStreamStarted = useSelector(statsHasStreamStartedSelector);
    const targets = useSelector(statsTargetsSelector);

    const {t} = useTranslation();

    const {isClosed, title, description} = useConnectionAlertView();

    const isCardGridShown = hasStreamStarted || targets.some(({origin}) => origin === OutputOriginEnum.Plugin);

    if (status !== ConnectionStatusEnum.Identified) {
        return (
            <Alert
                type={isClosed ? 'error' : 'info'}
                icon={isClosed ? <ApiOutlined/> : <LoadingOutlined/>}
                title={title}
                description={description}
                showIcon
            />
        );
    }

    return (
        <Flex
            className={style.page}
            gap="small"
            vertical
        >
            {isShowOutputCards && isCardGridShown && <CardGrid/>}

            {isShowOutputCards && !isCardGridShown && (
                <Card
                    size="small"
                    classNames={{
                        root: style.waiting,
                        body: style.waitingBody,
                    }}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('stats.waitingForFirstStream')}
                    />
                </Card>
            )}

            {isShowGeneralCard && <GeneralCard/>}

            {isAdviceModalVisible && <AdviceModal/>}
        </Flex>
    );
};

export default Page;
