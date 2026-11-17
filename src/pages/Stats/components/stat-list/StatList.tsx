import {Descriptions, Typography} from 'antd';

import StatLabel from '../stat-label';

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
                <StatLabel
                    label={label}
                    hint={hint}
                />
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
