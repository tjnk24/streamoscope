import {Descriptions} from 'antd';
import cn from 'classnames';

import QuestionTooltipLabel from '../question-tooltip-label';

import {LEVEL_CLASS_NAMES} from './consts';
import {Props} from './types';

import style from './style.module.scss';

const StatList = ({items, secondColumnStart}: Props) => {
    const firstColumnSize = secondColumnStart ?? items.length;

    const columns = [items.slice(0, firstColumnSize), items.slice(firstColumnSize)].filter(column => column.length > 0);

    return (
        <div className={cn(style.list, {[style.split]: columns.length > 1})}>
            {columns.map(column => (
                <Descriptions
                    key={column[0].key}
                    className={style.column}
                    size="small"
                    column={1}
                    colon={false}
                    classNames={{
                        label: style.itemLabel,
                        content: style.itemContent,
                    }}
                    items={column.map(({
                        key,
                        label,
                        hint,
                        level,
                        value,
                    }) => ({
                        key,
                        label: (
                            <QuestionTooltipLabel
                                label={label}
                                hint={hint}
                            />
                        ),
                        children: (
                            <span className={level && LEVEL_CLASS_NAMES[level]}>
                                {value}
                            </span>
                        ),
                    }))}
                />
            ))}
        </div>
    );
};

export default StatList;
