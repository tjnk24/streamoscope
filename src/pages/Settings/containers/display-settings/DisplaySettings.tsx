import {GlobalOutlined, UndoOutlined} from '@ant-design/icons';
import {
    Flex,
    Select,
    Switch,
    Typography,
} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import EnhancedButton from '__components/EnhancedButton';
import {settingsSelector} from '__selectors/settingsSelectors';
import {languageService} from '__services/languageService';
import {obsConnectionService} from '__services/obsConnectionService';
import {LanguageEnum} from '__types/i18n/language';

import {LANGUAGE_OPTIONS} from './consts';
import {getDockAddress} from './utils/getDockAddress';

import style from './style.module.scss';

const DisplaySettings = () => {
    const {isShowGeneralCard, language, isMockEnabled, cardOrder} = useSelector(settingsSelector);

    const {t} = useTranslation();

    const onResetCardOrder = () => commonActions.settings.setCardOrder([]);

    return (
        <Flex
            gap={14}
            vertical
        >
            <Flex
                align="center"
                justify="space-between"
                gap={14}
            >
                <Typography.Text>
                    <GlobalOutlined className={style.languageIcon}/>

                    {t('settings.languageLabel')}
                </Typography.Text>

                <Select<LanguageEnum>
                    className={style.languageSelect}
                    value={languageService.resolveLanguage(language)}
                    options={LANGUAGE_OPTIONS}
                    aria-label={t('settings.languageLabel')}
                    onChange={languageService.setLanguage}
                />
            </Flex>

            <Flex
                align="center"
                justify="space-between"
                gap={14}
            >
                <Typography.Text>
                    {t('settings.generalCard')}
                </Typography.Text>

                <Switch
                    checked={isShowGeneralCard}
                    onChange={commonActions.settings.setIsShowGeneralCard}
                />
            </Flex>

            <Flex
                align="flex-start"
                gap={14}
                vertical
            >
                <Flex vertical>
                    <Typography.Text>
                        {t('settings.cardOrder')}
                    </Typography.Text>

                    <Typography.Text type="secondary">
                        {t('settings.cardOrderHint')}
                    </Typography.Text>
                </Flex>

                <EnhancedButton
                    buttonProps={{
                        icon: <UndoOutlined/>,
                        disabled: cardOrder.length === 0,
                        onClick: onResetCardOrder,
                    }}
                >
                    {t('settings.resetCardOrder')}
                </EnhancedButton>
            </Flex>

            <Flex
                align="center"
                justify="space-between"
                gap={14}
            >
                <Typography.Text>
                    {t('settings.mockMode')}
                </Typography.Text>

                <Switch
                    checked={isMockEnabled}
                    onChange={obsConnectionService.setMockEnabled}
                />
            </Flex>

            <Flex
                gap={14}
                vertical
            >
                <Flex vertical>
                    <Typography.Text>
                        {t('settings.dockAddress')}
                    </Typography.Text>

                    <Typography.Text type="secondary">
                        {t('settings.dockAddressHint')}
                    </Typography.Text>
                </Flex>

                <Typography.Text
                    className={style.address}
                    code
                    copyable
                >
                    {getDockAddress(window.location.href)}
                </Typography.Text>
            </Flex>
        </Flex>
    );
};

export default DisplaySettings;
