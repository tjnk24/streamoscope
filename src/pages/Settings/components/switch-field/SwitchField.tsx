import {
    Flex,
    Switch,
    Typography,
} from 'antd';
import {useId} from 'react';

import {Props} from './types';

import style from './style.module.scss';

const SwitchField = ({label, hint, checked, onChange}: Props) => {
    const switchId = useId();

    return (
        <label
            className={style.field}
            htmlFor={switchId}
        >
            <Flex
                align="flex-start"
                gap={14}
            >
                <Switch
                    id={switchId}
                    className={style.switch}
                    checked={checked}
                    onChange={onChange}
                />

                <Flex vertical>
                    <Typography.Text>
                        {label}
                    </Typography.Text>

                    {hint && (
                        <Typography.Text type="secondary">
                            {hint}
                        </Typography.Text>
                    )}
                </Flex>
            </Flex>
        </label>
    );
};

export default SwitchField;
