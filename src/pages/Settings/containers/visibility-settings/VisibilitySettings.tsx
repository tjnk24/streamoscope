import {Checkbox, Flex} from 'antd';
import difference from 'lodash/difference';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import {settingsSelector} from '__selectors/settingsSelectors';
import {GeneralStatKeyEnum, OutputStatKeyEnum} from '__types/stats/statKeys';

import SwitchField from '../../components/switch-field';

import {GENERAL_STAT_OPTIONS, OUTPUT_STAT_OPTIONS} from './consts';

import style from './style.module.scss';

const VisibilitySettings = () => {
    const {isShowOutputCards,
        isShowGeneralCard,
        hiddenOutputStats,
        hiddenGeneralStats} = useSelector(settingsSelector);

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
            gap="14px 100px"
            wrap
        >
            <Flex
                gap={14}
                vertical
            >
                <SwitchField
                    label={t('settings.outputCards')}
                    checked={isShowOutputCards}
                    onChange={commonActions.settings.setIsShowOutputCards}
                />

                {isShowOutputCards && (
                    <Checkbox.Group<OutputStatKeyEnum>
                        className={style.statOptions}
                        value={difference(outputStatKeys, hiddenOutputStats)}
                        options={outputOptions}
                        onChange={onOutputStatsChange}
                    />
                )}
            </Flex>

            <Flex
                gap={14}
                vertical
            >
                <SwitchField
                    label={t('settings.generalCard')}
                    checked={isShowGeneralCard}
                    onChange={commonActions.settings.setIsShowGeneralCard}
                />

                {isShowGeneralCard && (
                    <Checkbox.Group<GeneralStatKeyEnum>
                        className={style.statOptions}
                        value={difference(generalStatKeys, hiddenGeneralStats)}
                        options={generalOptions}
                        onChange={onGeneralStatsChange}
                    />
                )}
            </Flex>
        </Flex>
    );
};

export default VisibilitySettings;
