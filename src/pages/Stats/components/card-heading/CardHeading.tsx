import {HolderOutlined} from '@ant-design/icons';
import {
    Badge,
    Flex,
    Tooltip,
} from 'antd';
import cn from 'classnames';
import {memo} from 'react';
import {useTranslation} from 'react-i18next';

import EnhancedText from '__components/EnhancedText';

import {Props} from './types';

import style from './style.module.scss';

const CardHeading = ({
    title,
    targetTitle,
    color,
    platformMark,
    hasDragHandle,
    isDragging,
    listeners,
    setActivatorNodeRef,
}: Props) => {
    const {t} = useTranslation();

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

            <EnhancedText className={cn({[style.platformTitle]: targetTitle})}>
                {title}
            </EnhancedText>

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
