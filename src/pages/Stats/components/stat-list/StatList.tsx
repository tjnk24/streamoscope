import {QuestionCircleOutlined} from '@ant-design/icons';
import {
    Descriptions,
    Flex,
    Tooltip,
    Typography,
} from 'antd';

import EnhancedText from '__components/EnhancedText';

import {LEVEL_TEXT_TYPES} from './consts';
import {Props} from './types';

import style from './style.module.scss';

const StatList = ({items, column = 1}: Props) => (
    <Descriptions
        className={style.list}
        size="small"
        column={column}
        colon={false}
        classNames={{
            label: style.itemLabel,
            content: style.itemContent,
        }}
        items={items.map(({
            key,
            label,
            hint,
            level,
            value,
        }) => ({
            key,
            label: (
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
            ),
            children: (
                <Typography.Text type={level ? LEVEL_TEXT_TYPES[level] : undefined}>
                    {value}
                </Typography.Text>
            ),
        }))}
    />
);

export default StatList;
