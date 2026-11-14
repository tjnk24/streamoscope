import {Collapse, Flex} from 'antd';
import {useTranslation} from 'react-i18next';

import {SETTINGS_BLOCK_GAP} from '../../consts';
import DiagnosticsSettings from '../diagnostics-settings';
import DisplaySettings from '../display-settings';
import PasswordSettings from '../password-settings';
import PortSettings from '../port-settings';
import UpdateSettings from '../update-settings';
import VisibilitySettings from '../visibility-settings';

import {useOpenGroups} from './hooks/useOpenGroups';
import {SettingsGroupEnum} from './types';

import style from './style.module.scss';

const {Display, Updates, Diagnostics, Connection} = SettingsGroupEnum;

const Page = () => {
    const {t} = useTranslation();

    const {openGroups, toggleGroup} = useOpenGroups();

    const groups = [
        {
            key: Display,
            label: t('settings.displayTitle'),
            children: (
                <Flex
                    gap={SETTINGS_BLOCK_GAP}
                    vertical
                >
                    <DisplaySettings/>

                    <VisibilitySettings/>
                </Flex>
            ),
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
                    gap={SETTINGS_BLOCK_GAP}
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
                    classNames={{body: style.body}}
                    items={[{...group, forceRender: true}]}
                />
            ))}
        </Flex>
    );
};

export default Page;
