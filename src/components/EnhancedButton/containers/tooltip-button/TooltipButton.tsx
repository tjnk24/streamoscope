import {Tooltip, TooltipProps} from 'antd';
import cn from 'classnames';

import CommonButton from '../common-button';

import {Props} from './types';

import style from './style.module.scss';

const TooltipButton = ({buttonProps, tooltipProps, children, withSpinner}: Props) => {
    const {className: tooltipClassName, trigger = ['hover', 'click'], ...tooltipPropsRest}: TooltipProps = tooltipProps || {};

    const {className: buttonClassName, disabled, ...buttonPropsRest} = buttonProps;

    const triggerStates = {
        [style.disabledTrigger]: disabled,
        [style.hidden]: buttonProps.hidden,
    };

    return (
        <Tooltip
            {...tooltipPropsRest}
            trigger={trigger}
        >
            <span
                className={cn(style.trigger, triggerStates, tooltipClassName)}
            >
                <CommonButton
                    {...buttonPropsRest}
                    className={cn({[style.disabledButton]: disabled}, buttonClassName)}
                    withSpinner={withSpinner}
                    disabled={disabled}
                >
                    {children}
                </CommonButton>
            </span>
        </Tooltip>
    );
};

export default TooltipButton;
