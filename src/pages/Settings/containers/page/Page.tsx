import {Collapse, Flex} from 'antd';
import {useTranslation} from 'react-i18next';

import DiagnosticsSettings from '../diagnostics-settings';
import DisplaySettings from '../display-settings';
import PasswordSettings from '../password-settings';
import PortSettings from '../port-settings';
import UpdateSettings from '../update-settings';
import VisibilitySettings from '../visibility-settings';

import {useOpenGroups} from './hooks/useOpenGroups';
import {SettingsGroupEnum} from './types';

const {
    Display,
    Visibility,
    Updates,
    Diagnostics,
    Connection,
} = SettingsGroupEnum;

const Page = () => {
    const {t} = useTranslation();

    const {openGroups, toggleGroup} = useOpenGroups();

    const groups = [
        {
            key: Display,
            label: t('settings.displayTitle'),
            children: <DisplaySettings/>,
        },
        {
            key: Visibility,
            label: t('settings.visibilityTitle'),
            children: <VisibilitySettings/>,
        },
        {
            key: Updates,
            label: t('settings.updatesTitle'),
            children: <UpdateSettings/>,
        },
        {
            key: Diagnostics,
            label: t('settings.diagnosticsTitle'),
            children: <DiagnosticsSettings/>,
        },
        {
            key: Connection,
            label: t('settings.connectionTitle'),
            children: (
                <Flex
                    gap={14}
                    vertical
                >
                    <PortSettings/>

                    <PasswordSettings/>
                </Flex>
            ),
        },
    ];

    return (
        <Flex
            gap="small"
            vertical
        >
            {groups.map(group => (
                <Collapse
                    key={group.key}
                    activeKey={openGroups}
                    onChange={() => toggleGroup(group.key)}
                    size="small"
                    items={[{...group, forceRender: true}]}
                />
            ))}
        </Flex>
    );
};

export default Page;
