import {
    Alert,
    Card,
    Empty,
    Flex,
    Statistic,
    Tag,
} from 'antd';
import cn from 'classnames';
import isNumber from 'lodash/isNumber';
import {memo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {commonActions} from '__actions';
import {AdviceEnum} from '__types/stats/views';

import BitrateGraph from '../../components/bitrate-graph';
import CardHeading from '../../components/card-heading';
import StatList from '../../components/stat-list';
import {formatNumber} from '../../utils/formatNumber';
import AdviceIcon from '../advice-icon';

import {useOutputCardView} from './hooks/useOutputCardView';
import {Props} from './types';

import style from './style.module.scss';

const OutputCard = ({target, isDragging, listeners, setActivatorNodeRef}: Props) => {
    const {t} = useTranslation();

    const {
        title,
        targetTitle,
        color,
        platformChoices,
        selectedPlatform,
        notes,
        hasReconnectAdvice,
        hasDragHandle,
        platformMark,
        isStatusShown,
        healthTag,
        statusKey,
        isActive,
        isWaitingForStream,
        isBitrateShown,
        bitrate,
        isBitrateLoading,
        graph,
        now,
        items,
    } = useOutputCardView(target);

    const {key: cardKey, keyId} = target;

    const handlePlatformChange = useCallback((platform: string) => {
        commonActions.settings.setCardPlatform({cardKey, platform, keyId});
    }, [cardKey, keyId]);

    return (
        <Card
            size="small"
            classNames={{
                root: cn(style.card, {[style.dragging]: isDragging}),
                title: style.title,
                body: style.body,
            }}
            title={(
                <CardHeading
                    title={title}
                    targetTitle={targetTitle}
                    color={color}
                    platformChoices={platformChoices}
                    selectedPlatform={selectedPlatform}
                    onPlatformChange={handlePlatformChange}
                    platformMark={platformMark}
                    hasDragHandle={hasDragHandle}
                    isDragging={isDragging}
                    listeners={listeners}
                    setActivatorNodeRef={setActivatorNodeRef}
                />
            )}
            extra={(
                <Flex align="center">
                    {hasReconnectAdvice && <AdviceIcon advice={AdviceEnum.Reconnecting}/>}

                    {isStatusShown && (
                        <Tag
                            color={healthTag.color}
                            variant={healthTag.variant}
                        >
                            {t(statusKey)}
                        </Tag>
                    )}
                </Flex>
            )}
        >
            {isWaitingForStream && (
                <Empty
                    className={style.empty}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('stats.waitingForStream')}
                />
            )}

            {!isWaitingForStream && isBitrateShown && (
                <Flex
                    className={style.bitrateRow}
                    align="center"
                    gap="middle"
                >
                    <Statistic
                        value={bitrate}
                        loading={isBitrateLoading}
                        formatter={value => (isNumber(value) ? formatNumber(value) : value)}
                        suffix={t('stats.bitrateUnit')}
                        classNames={{
                            root: style.bitrate,
                            content: cn(style.bitrateValue, {[style.inactiveBitrate]: !isActive}),
                            suffix: style.bitrateUnit,
                        }}
                    />

                    <BitrateGraph
                        points={graph}
                        now={now}
                        color={color}
                        isActive={isActive}
                    />
                </Flex>
            )}

            {items.length > 0 && <StatList items={items}/>}

            {notes.map(({textKey, values, type}) => (
                <Alert
                    key={textKey}
                    className={style.note}
                    type={type}
                    title={t(textKey, values)}
                    showIcon
                />
            ))}
        </Card>
    );
};

export default memo(OutputCard);
