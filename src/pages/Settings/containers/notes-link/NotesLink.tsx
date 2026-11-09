import {Typography} from 'antd';

import {updateService} from '__services/updateService';

import {Props} from './types';

const NotesLink = ({href, children}: Props) => (
    <Typography.Link onClick={() => updateService.openReleasePage(href)}>
        {children}
    </Typography.Link>
);

export default NotesLink;
