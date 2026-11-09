import {GetProps, Typography} from 'antd';

type TextProps = GetProps<typeof Typography.Text>;

interface OwnProps {
    children: string;
}

export type Props = OwnProps & Omit<TextProps, 'children' | 'ellipsis'>;
