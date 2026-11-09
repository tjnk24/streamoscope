import {
    Alert,
    Badge,
    Card,
    Flex,
    Statistic,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';

import {AdviceEnum} from '__types/stats/views';

import BitrateGraph from '../../components/bitrate-graph';
import StatList from '../../components/stat-list';
import {formatNumber} from '../../utils/formatNumber';
import AdviceIcon from '../advice-icon';

import {useOutputCardView} from './hooks/useOutputCardView';
import {Props} from './types';

import style from './style.module.scss';

const OutputCard = ({target}: Props) => {
    const {t} = useTranslation();

    const {
        title,
        color,
        notes,
        hasReconnectAdvice,
        platformMark,
        healthTag,
        statusKey,
        isActive,
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
                root: style.card,
                title: style.title,
                body: style.body,
            }}
            title={(
                <Flex
                    className={style.heading}
                    align="center"
                    gap={6}
                >
                    <Badge color={color}/>

                    <Typography.Text ellipsis={{tooltip: title}}>
                        {title}
                    </Typography.Text>

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
            <Flex
                className={style.bitrateRow}
                align="center"
                gap="middle"
            >
                <Statistic
                    value={bitrate}
                    loading={isBitrateLoading}
                    formatter={value => (typeof value === 'number' ? formatNumber(value) : value)}
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

export default OutputCard;
