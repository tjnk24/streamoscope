import {BgColorsOutlined, GlobalOutlined} from '@ant-design/icons';
import {
    Flex,
    Select,
    Typography,
} from 'antd';
import {useId} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import {settingsLanguageSelector, settingsThemeModeSelector} from '__selectors/settingsSelectors';
import {languageService} from '__services/languageService';
import {LanguageEnum} from '__types/i18n/language';
import {ThemeModeEnum} from '__types/theme';

import {LANGUAGE_OPTIONS, THEME_MODE_TEXTS} from './consts';

import style from './style.module.scss';

const DisplaySettings = () => {
    const language = useSelector(settingsLanguageSelector);
    const themeMode = useSelector(settingsThemeModeSelector);

    const {t} = useTranslation();

    const languageSelectId = useId();

    const themeModeSelectId = useId();

    const themeModeOptions = Object.values(ThemeModeEnum).map(mode => ({value: mode, label: t(THEME_MODE_TEXTS[mode])}));

    return (
        <Flex
            gap="large"
            wrap
        >
            <Flex
                gap="small"
                vertical
            >
                <label htmlFor={languageSelectId}>
                    <Typography.Text>
                        <GlobalOutlined className={style.labelIcon}/>

                        {t('settings.languageLabel')}
                    </Typography.Text>
                </label>

                <Select<LanguageEnum>
                    id={languageSelectId}
                    className={style.select}
                    value={languageService.resolveLanguage(language)}
                    options={LANGUAGE_OPTIONS}
                    onChange={languageService.setLanguage}
                />
            </Flex>

            <Flex
                gap="small"
                vertical
            >
                <label htmlFor={themeModeSelectId}>
                    <Typography.Text>
                        <BgColorsOutlined className={style.labelIcon}/>

                        {t('settings.themeLabel')}
                    </Typography.Text>
                </label>

                <Select<ThemeModeEnum>
                    id={themeModeSelectId}
                    className={style.select}
                    value={themeMode}
                    options={themeModeOptions}
                    onChange={commonActions.settings.setThemeMode}
                />
            </Flex>
        </Flex>
    );
};

export default DisplaySettings;
