import {HolderOutlined} from '@ant-design/icons';
import {
    Alert,
    Badge,
    Card,
    Empty,
    Flex,
    Statistic,
    Tag,
    Tooltip,
} from 'antd';
import cn from 'classnames';
import isNumber from 'lodash/isNumber';
import {memo} from 'react';
import {useTranslation} from 'react-i18next';

import EnhancedText from '__components/EnhancedText';
import {AdviceEnum} from '__types/stats/views';

import BitrateGraph from '../../components/bitrate-graph';
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
        color,
        notes,
        hasReconnectAdvice,
        hasDragHandle,
        platformMark,
        healthTag,
        statusKey,
        isActive,
        isWaitingForStream,
        bitrate,
        isBitrateLoading,
        graph,
        now,
        items,
    } = useOutputCardView(target);

    return (
        <Card
            size="small"
            classNames={{
                root: cn(style.card, {[style.dragging]: isDragging}),
                title: style.title,
                body: style.body,
            }}
            title={(
                <Flex
                    ref={setActivatorNodeRef}
                    className={cn(style.heading, {[style.draggable]: hasDragHandle})}
                    align="center"
                    gap={6}
                    {...listeners}
                >
                    {hasDragHandle && (
                        <HolderOutlined className={style.handle}/>
                    )}

                    <Badge color={color}/>

                    <EnhancedText>
                        {title}
                    </EnhancedText>

                    {platformMark && (
                        <Tooltip title={t(platformMark.hintKey)}>
                            <span>{platformMark.emoji}</span>
                        </Tooltip>
                    )}
                </Flex>
            )}
            extra={(
                <Flex align="center">
                    {hasReconnectAdvice && <AdviceIcon advice={AdviceEnum.Reconnecting}/>}

                    <Tag
                        color={healthTag.color}
                        variant={healthTag.variant}
                    >
                        {t(statusKey)}
                    </Tag>
                </Flex>
            )}
        >
            {isWaitingForStream ? (
                <Empty
                    className={style.empty}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('stats.waitingForStream')}
                />
            ) : (
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

            <StatList items={items}/>

            {notes.map(({text, type}) => (
                <Alert
                    key={text}
                    className={style.note}
                    type={type}
                    title={text}
                    showIcon
                />
            ))}
        </Card>
    );
};

export default memo(OutputCard);
