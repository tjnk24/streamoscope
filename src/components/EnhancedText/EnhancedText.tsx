import {Typography} from 'antd';

import {Props} from './types';

const EnhancedText = ({children, ...textProps}: Props) => (
    <Typography.Text
        {...textProps}
        ellipsis={{tooltip: children}}
    >
        {children}
    </Typography.Text>
);

export default EnhancedText;
