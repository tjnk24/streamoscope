import {
    ButtonProps,
    PopconfirmProps,
    TooltipProps,
} from 'antd';
import type {Nullable} from 'infrastructure/common';
import {ReactNode} from 'react';

interface PopconfirmTitleProps {
    title?: ReactNode;
}

export type EnhancedPopconfirmProps = Omit<PopconfirmProps, 'title'> & PopconfirmTitleProps;

interface OwnProps {
    buttonProps: ButtonProps;
    popconfirmProps: EnhancedPopconfirmProps;
    tooltipProps: Nullable<TooltipProps>;
    withSpinner: boolean;
    children: ReactNode;
}

export type Props = OwnProps;
