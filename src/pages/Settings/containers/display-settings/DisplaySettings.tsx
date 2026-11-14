import {GlobalOutlined} from '@ant-design/icons';
import {
    Flex,
    Select,
    Typography,
} from 'antd';
import {useId} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {settingsLanguageSelector} from '__selectors/settingsSelectors';
import {languageService} from '__services/languageService';
import {LanguageEnum} from '__types/i18n/language';

import {LANGUAGE_OPTIONS} from './consts';

import style from './style.module.scss';

const DisplaySettings = () => {
    const language = useSelector(settingsLanguageSelector);

    const {t} = useTranslation();

    const languageSelectId = useId();

    return (
        <Flex
            gap="small"
            vertical
        >
            <label htmlFor={languageSelectId}>
                <Typography.Text>
                    <GlobalOutlined className={style.languageIcon}/>

                    {t('settings.languageLabel')}
                </Typography.Text>
            </label>

            <Select<LanguageEnum>
                id={languageSelectId}
                className={style.languageSelect}
                value={languageService.resolveLanguage(language)}
                options={LANGUAGE_OPTIONS}
                onChange={languageService.setLanguage}
            />
        </Flex>
    );
};

export default DisplaySettings;
