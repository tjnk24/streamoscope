import {ArrowLeftOutlined, SettingOutlined} from '@ant-design/icons';
import {
    Alert,
    Badge,
    Flex,
    Spin,
} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Outlet, useMatch} from 'react-router';

import EnhancedButton from '__components/EnhancedButton';
import EnhancedText from '__components/EnhancedText';
import {ROUTES} from '__routes/app';
import {connectionIsSwitchingCollectionSelector, connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsIsMockEnabledSelector} from '__selectors/settingsSelectors';
import {obsConnectionService} from '__services/obsConnectionService';
import {routerManager} from '__services/routerManager';

import BridgeNotice from '../bridge-notice';

import {CONNECTION_BADGES} from './consts';
import {useHeaderStageView} from './hooks/useHeaderStageView';

import style from './style.module.scss';

const MainLayout = () => {
    const status = useSelector(connectionStatusSelector);
    const isMockEnabled = useSelector(settingsIsMockEnabledSelector);
    const isSwitchingCollection = useSelector(connectionIsSwitchingCollectionSelector);

    const {t} = useTranslation();

    const {stageKey} = useHeaderStageView();

    const isSettingsPage = Boolean(useMatch(ROUTES.SETTINGS.INDEX));

    const {status: badgeStatus, textKey} = CONNECTION_BADGES[status];

    return (
        <Flex
            className={style.layout}
            gap="small"
            vertical
        >
            <Flex
                className={style.header}
                align="center"
                justify="space-between"
                gap="small"
            >
                <Flex
                    className={style.status}
                    align="center"
                    gap={14}
                >
                    <Badge
                        status={badgeStatus}
                        text={t(textKey)}
                    />

                    {stageKey && (
                        <Flex
                            className={style.status}
                            align="center"
                            gap="small"
                        >
                            <Spin size="small"/>

                            <EnhancedText type="secondary">
                                {t(stageKey)}
                            </EnhancedText>
                        </Flex>
                    )}
                </Flex>

                <EnhancedButton
                    buttonProps={isSettingsPage
                        ? {
                            type: 'text',
                            size: 'small',
                            icon: <ArrowLeftOutlined/>,
                            'aria-label': t('header.toStats'),
                            onClick: () => routerManager.goToStats(),
                        }
                        : {
                            type: 'text',
                            size: 'small',
                            icon: <SettingOutlined/>,
                            'aria-label': t('header.toSettings'),
                            onClick: () => routerManager.goToSettings(),
                        }}
                    withSpinner={false}
                />
            </Flex>

            {isMockEnabled && (
                <Alert
                    type="warning"
                    title={t('mock.banner')}
                    action={(
                        <EnhancedButton
                            buttonProps={{
                                type: 'link',
                                size: 'small',
                                onClick: () => obsConnectionService.setMockEnabled(false),
                            }}
                            withSpinner={false}
                        >
                            {t('mock.disable')}
                        </EnhancedButton>
                    )}
                    showIcon
                />
            )}

            <BridgeNotice/>

            <Flex
                className={isSwitchingCollection ? `${style.content} ${style.switching}` : style.content}
                vertical
            >
                <Outlet/>
            </Flex>
        </Flex>
    );
};

export default MainLayout;
