import {ApiOutlined, LoadingOutlined} from '@ant-design/icons';
import {Alert, Flex} from 'antd';
import {useSelector} from 'react-redux';

import {connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsIsShowGeneralCardSelector} from '__selectors/settingsSelectors';
import {statsTargetsSelector} from '__selectors/statsSelectors';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {adviceModalSelector} from '../../selectors/adviceModalSelectors';
import AdviceModal from '../advice-modal';
import GeneralCard from '../general-card';
import OutputCard from '../output-card';

import {useConnectionAlertView} from './hooks/useConnectionAlertView';

import style from './style.module.scss';

const Page = () => {
    const status = useSelector(connectionStatusSelector);
    const targets = useSelector(statsTargetsSelector);
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
            <div className={style.cards}>
                {targets.map(target => (
                    <OutputCard
                        key={target.key}
                        target={target}
                    />
                ))}
            </div>

            {isShowGeneralCard && <GeneralCard/>}

            {isAdviceModalVisible && <AdviceModal/>}
        </Flex>
    );
};

export default Page;
