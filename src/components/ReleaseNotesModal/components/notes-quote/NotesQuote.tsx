import {Alert} from 'antd';
import {Children} from 'react';

import {Props} from './types';

const NotesQuote = ({className, children}: Props) => {
    if (!className?.startsWith('markdown-alert-')) {
        return <blockquote>{children}</blockquote>;
    }

    const content = Children.toArray(children).slice(1);

    return (
        <Alert
            type="warning"
            title={content}
        />
    );
};

export default NotesQuote;
