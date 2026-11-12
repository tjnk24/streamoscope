import {ApiOutlined, LoadingOutlined} from '@ant-design/icons';
import {Alert, Flex} from 'antd';
import {useSelector} from 'react-redux';

import {connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsIsShowGeneralCardSelector} from '__selectors/settingsSelectors';
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
            <CardGrid/>

            {isShowGeneralCard && <GeneralCard/>}

            {isAdviceModalVisible && <AdviceModal/>}
        </Flex>
    );
};

export default Page;
