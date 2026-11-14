import {
    Checkbox,
    Flex,
    Switch,
    Typography,
} from 'antd';
import difference from 'lodash/difference';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import {settingsSelector} from '__selectors/settingsSelectors';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '__types/stats/statKeys';

import {GENERAL_STAT_OPTIONS, OUTPUT_STAT_OPTIONS} from './consts';

import style from './style.module.scss';

const VisibilitySettings = () => {
    const {isShowGeneralCard, hiddenOutputStats, hiddenGeneralStats} = useSelector(settingsSelector);

    const {t} = useTranslation();

    const outputStatKeys = Object.values(OutputStatKeyEnum);

    const generalStatKeys = Object.values(GeneralStatKeyEnum);

    const outputOptions = OUTPUT_STAT_OPTIONS.map(({value, labelKey}) => ({value, label: t(labelKey)}));

    const generalOptions = GENERAL_STAT_OPTIONS.map(({value, labelKey}) => ({value, label: t(labelKey)}));

    const onOutputStatsChange = (shownStats: OutputStatKeyEnum[]) => {
        commonActions.settings.setHiddenOutputStats(difference(outputStatKeys, shownStats));
    };

    const onGeneralStatsChange = (shownStats: GeneralStatKeyEnum[]) => {
        commonActions.settings.setHiddenGeneralStats(difference(generalStatKeys, shownStats));
    };

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
                    {t('settings.generalCard')}
                </Typography.Text>

                <Switch
                    checked={isShowGeneralCard}
                    onChange={commonActions.settings.setIsShowGeneralCard}
                />
            </Flex>

            <Flex
                gap="14px 118px"
                wrap
            >
                <Flex
                    gap={14}
                    vertical
                >
                    <Typography.Text>
                        {t('settings.outputStats')}
                    </Typography.Text>

                    <Checkbox.Group<OutputStatKeyEnum>
                        className={style.statOptions}
                        value={difference(outputStatKeys, hiddenOutputStats)}
                        options={outputOptions}
                        onChange={onOutputStatsChange}
                    />
                </Flex>

                <Flex
                    gap={14}
                    vertical
                >
                    <Typography.Text type={isShowGeneralCard ? undefined : 'secondary'}>
                        {t('settings.generalStats')}
                    </Typography.Text>

                    <Checkbox.Group<GeneralStatKeyEnum>
                        className={style.statOptions}
                        value={difference(generalStatKeys, hiddenGeneralStats)}
                        options={generalOptions}
                        disabled={!isShowGeneralCard}
                        onChange={onGeneralStatsChange}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default VisibilitySettings;
