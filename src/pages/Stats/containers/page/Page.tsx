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
import {settingsIsShowGeneralCardSelector} from '__selectors/settingsSelectors';
import {statsHasStreamStartedSelector} from '__selectors/statsSelectors';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {adviceModalSelector} from '../../selectors/adviceModalSelectors';
import AdviceModal from '../advice-modal';
import CardGrid from '../card-grid';
import GeneralCard from '../general-card';

import {useConnectionAlertView} from './hooks/useConnectionAlertView';

import style from './style.module.scss';

const Page = () => {
    const status = useSelector(connectionStatusSelector);
    const isShowGeneralCard = useSelector(settingsIsShowGeneralCardSelector);
    const {isVisible: isAdviceModalVisible} = useSelector(adviceModalSelector);
    const hasStreamStarted = useSelector(statsHasStreamStartedSelector);

    const {t} = useTranslation();

    const {isClosed, title, description} = useConnectionAlertView();

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
            {hasStreamStarted ? (
                <CardGrid/>
            ) : (
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
