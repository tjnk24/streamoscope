import {QuestionCircleOutlined} from '@ant-design/icons';
import {Flex, Tooltip} from 'antd';
import {memo} from 'react';

import EnhancedText from '__components/EnhancedText';

import {Props} from './types';

import style from './style.module.scss';

const StatLabel = ({label, hint}: Props) => (
    <Flex
        className={style.label}
        align="center"
        gap={4}
    >
        <EnhancedText className={style.labelText}>
            {label}
        </EnhancedText>

        {hint && (
            <Tooltip title={hint}>
                <QuestionCircleOutlined/>
            </Tooltip>
        )}
    </Flex>
);

export default memo(StatLabel);
