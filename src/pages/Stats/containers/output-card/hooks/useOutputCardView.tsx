import {Tag} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {statsSelector} from '__selectors/statsSelectors';
import {AdviceEnum, HealthLevelEnum} from '__types/stats/views';
import {StreamTargetDto} from '__types/targets';
import {OFF_OUTPUT_VIEW, RECENT_WINDOW_SEC} from '__utils/consts';

import CongestionProgress from '../../../components/congestion-progress';
import {formatNumber} from '../../../utils/formatNumber';
import {formatPercent} from '../../../utils/formatPercent';
import {formatTimecode} from '../../../utils/formatTimecode';
import AdviceIcon from '../../advice-icon';
import {HEALTH_TAGS, PLATFORM_MARKS} from '../consts';
import style from '../style.module.scss';
import {OutputCardViewDto, OutputStatKeyEnum} from '../types';
import {getTargetSource} from '../utils/getTargetSource';

const {Off, Warn} = HealthLevelEnum;

const {Reconnecting, DroppedFrames, Congestion: CongestionAdvice} = AdviceEnum;

const {
    Source,
    Timecode,
    Dropped,
    Recent,
    Congestion,
} = OutputStatKeyEnum;

export const useOutputCardView = (target: StreamTargetDto): OutputCardViewDto => {
    const {view: {outputs, now}, targets} = useSelector(statsSelector);

    const {t} = useTranslation();

    const {platform: {title, color}, notes} = target;

    const {
        isActive,
        isReconnecting,
        level,
        kbps,
        timecode,
        dropped,
        total,
        recentDropped,
        recentTotal,
        congestion,
        graph,
        advices,
    } = outputs[target.key] || OFF_OUTPUT_VIEW;

    const valueLevel = isActive ? undefined : Off;

    const source = getTargetSource(target);

    const recentValue = recentDropped > 0
        ? `${formatNumber(recentDropped)} (${formatPercent(recentDropped, recentTotal)})`
        : '0';

    return {
        title,
        color,
        notes,
        hasReconnectAdvice: advices.includes(Reconnecting),
        hasDragHandle: targets.length > 1,
        platformMark: PLATFORM_MARKS[title] ?? null,
        healthTag: HEALTH_TAGS[isReconnecting ? Warn : level],
        statusKey: isReconnecting ? 'stats.statuses.reconnecting' : `stats.statuses.${level}`,
        isActive,
        bitrate: isActive && kbps !== null ? Math.round(kbps) : '—',
        isBitrateLoading: isActive && kbps === null,
        graph,
        now,
        items: [
            {
                key: Source,
                label: t('stats.source'),
                hint: source.hint,
                value: (
                    <Tag
                        className={style.sourceTag}
                        color={source.color ?? undefined}
                        variant="outlined"
                    >
                        {source.text}
                    </Tag>
                ),
            },
            {
                key: Timecode,
                label: t('stats.onAir'),
                level: valueLevel,
                value: isActive ? formatTimecode(timecode) : '—',
            },
            {
                key: Dropped,
                label: t('stats.dropped'),
                hint: t('stats.hints.dropped'),
                level: valueLevel,
                value: isActive ? `${formatNumber(dropped)} (${formatPercent(dropped, total)})` : '—',
            },
            {
                key: Recent,
                label: t('stats.recent'),
                hint: t('stats.hints.recent', {seconds: RECENT_WINDOW_SEC}),
                level: isActive ? level : Off,
                value: isActive
                    ? (
                        <>
                            {advices.includes(DroppedFrames) && <AdviceIcon advice={DroppedFrames}/>}

                            {recentValue}
                        </>
                    )
                    : '—',
            },
            {
                key: Congestion,
                label: t('stats.congestion'),
                hint: t('stats.hints.congestion'),
                level: valueLevel,
                value: isActive
                    ? (
                        <span className={style.congestionValue}>
                            {advices.includes(CongestionAdvice) && <AdviceIcon advice={CongestionAdvice}/>}

                            <CongestionProgress value={congestion}/>
                        </span>
                    )
                    : '—',
            },
        ],
    };
};
