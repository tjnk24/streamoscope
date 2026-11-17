import {HolderOutlined} from '@ant-design/icons';
import {
    Badge,
    Flex,
    RefSelectProps,
    Select,
    Tooltip,
} from 'antd';
import cn from 'classnames';
import {
    memo,
    PointerEvent,
    useRef,
    useState,
} from 'react';
import {useTranslation} from 'react-i18next';

import EnhancedText from '__components/EnhancedText';

import {Props} from './types';

import style from './style.module.scss';

const CardHeading = ({
    title,
    targetTitle,
    color,
    platformChoices,
    selectedPlatform,
    onPlatformChange,
    platformMark,
    hasDragHandle,
    isDragging,
    listeners,
    setActivatorNodeRef,
}: Props) => {
    const [isPlatformListOpen, setIsPlatformListOpen] = useState(false);

    const {t} = useTranslation();

    const platformSelectRef = useRef<RefSelectProps>(null);

    const hasPlatformChoices = platformChoices.length > 0;
    const platformOptions = platformChoices.map(choice => ({value: choice, label: choice}));
    const platformHint = selectedPlatform || isPlatformListOpen ? null : t('stats.sharedServersHint');

    const keepFromDragging = (event: PointerEvent) => event.stopPropagation();

    const handlePlatformChange = (platform: string) => {
        platformSelectRef.current?.blur();
        onPlatformChange(platform);
    };

    return (
        <Flex
            ref={setActivatorNodeRef}
            className={cn(style.heading, {[style.draggable]: hasDragHandle, [style.dragging]: isDragging})}
            align="center"
            gap={6}
            {...listeners}
        >
            {hasDragHandle && (
                <HolderOutlined className={style.handle}/>
            )}

            <Badge color={color}/>

            {hasPlatformChoices && (
                <Tooltip title={platformHint}>
                    <span
                        className={style.platformSelect}
                        onPointerDown={keepFromDragging}
                    >
                        <Select
                            ref={platformSelectRef}
                            size="small"
                            variant="borderless"
                            value={selectedPlatform ?? undefined}
                            placeholder={t('stats.choosePlatform')}
                            options={platformOptions}
                            popupMatchSelectWidth={false}
                            classNames={{root: style.select, placeholder: style.selectPlaceholder}}
                            onChange={handlePlatformChange}
                            onOpenChange={setIsPlatformListOpen}
                        />
                    </span>
                </Tooltip>
            )}

            {!hasPlatformChoices && (
                <EnhancedText className={cn({[style.platformTitle]: targetTitle})}>
                    {title}
                </EnhancedText>
            )}

            {platformMark && (
                <Tooltip title={t(platformMark.hintKey)}>
                    <span>{platformMark.emoji}</span>
                </Tooltip>
            )}

            {targetTitle && (
                <EnhancedText
                    className={style.targetTitle}
                    type="secondary"
                >
                    {targetTitle}
                </EnhancedText>
            )}
        </Flex>
    );
};

export default memo(CardHeading);
