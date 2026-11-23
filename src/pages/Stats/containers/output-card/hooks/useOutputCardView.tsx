import {Tag, theme} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {settingsSelector} from '__selectors/settingsSelectors';
import {statsSelector} from '__selectors/statsSelectors';
import {OutputStatKeyEnum} from '__types/stats/statKeys';
import {AdviceEnum, HealthLevelEnum} from '__types/stats/views';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {ensureContrast} from '__utils/appearance/colors/ensureContrast';
import {GRAPHIC_MIN_CONTRAST, OFF_OUTPUT_VIEW} from '__utils/consts';
import {resolveTargetPlatform} from '__utils/targets/resolveTargetPlatform';

import CongestionProgress from '../../../components/congestion-progress';
import {StatItemDto} from '../../../components/stat-list';
import {formatNumber} from '../../../utils/formatNumber';
import {formatPercent} from '../../../utils/formatPercent';
import {formatTimecode} from '../../../utils/formatTimecode';
import AdviceHint from '../../advice-hint';
import {HEALTH_TAGS, PLATFORM_MARKS} from '../consts';
import style from '../style.module.scss';
import {OutputCardViewDto} from '../types';
import {getTargetSource} from '../utils/getTargetSource';

const {Off, Warn} = HealthLevelEnum;

const {Reconnecting, DroppedFrames, Congestion: CongestionAdvice} = AdviceEnum;

const {
    Status,
    Bitrate,
    Source,
    Timecode,
    Dropped,
    Recent,
    Congestion,
} = OutputStatKeyEnum;

export const useOutputCardView = (target: StreamTargetDto): OutputCardViewDto => {
    const {view: {outputs, now}, targets} = useSelector(statsSelector);
    const {hiddenOutputStats, cardPlatforms} = useSelector(settingsSelector);

    const {t} = useTranslation();

    const {token} = theme.useToken();

    const {origin, targetTitle, notes} = target;

    const {title, color, choices, selected} = resolveTargetPlatform(target, cardPlatforms);

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

    const fallbackTitleKey = origin === OutputOriginEnum.Main ? 'stats.mainFallbackTitle' : 'stats.unknownPlatform';

    const platformTitle = title ?? t(fallbackTitleKey);

    const isWaitingForStream = !isActive && !isReconnecting;

    const valueLevel = isActive ? undefined : Off;

    const source = getTargetSource(target);

    const recentValue = recentDropped > 0
        ? `${formatNumber(recentDropped)} (${formatPercent(recentDropped, recentTotal)})`
        : '0';

    const items: StatItemDto<OutputStatKeyEnum>[] = [
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
            hint: t('stats.hints.recent'),
            level: isActive ? level : Off,
            value: isActive
                ? (
                    <AdviceHint
                        advice={DroppedFrames}
                        isShown={advices.includes(DroppedFrames)}
                    >
                        {recentValue}
                    </AdviceHint>
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
                        <AdviceHint
                            advice={CongestionAdvice}
                            isShown={advices.includes(CongestionAdvice)}
                        >
                            <CongestionProgress value={congestion}/>
                        </AdviceHint>
                    </span>
                )
                : '—',
        },
    ];

    const shownItems = items.filter(({key}) => !hiddenOutputStats.includes(key));

    const visibleItems = isWaitingForStream ? shownItems.filter(({key}) => key === Source) : shownItems;

    return {
        title: platformTitle,
        targetTitle: targetTitle && targetTitle.toLowerCase() !== platformTitle.toLowerCase() ? targetTitle : null,
        color: ensureContrast(color, token.colorBgContainer, GRAPHIC_MIN_CONTRAST),
        platformChoices: choices,
        selectedPlatform: selected,
        notes,
        hasReconnectAdvice: advices.includes(Reconnecting),
        hasDragHandle: targets.length > 1,
        platformMark: PLATFORM_MARKS[platformTitle] ?? null,
        healthTag: HEALTH_TAGS[isReconnecting ? Warn : level],
        isStatusShown: !hiddenOutputStats.includes(Status),
        statusKey: isReconnecting ? 'stats.statuses.reconnecting' : `stats.statuses.${level}`,
        isActive,
        isWaitingForStream,
        isBitrateShown: !hiddenOutputStats.includes(Bitrate),
        bitrate: isActive && kbps !== null ? Math.round(kbps) : '—',
        isBitrateLoading: isActive && kbps === null,
        graph,
        now,
        items: visibleItems,
    };
};
