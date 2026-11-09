import {SyncOutlined} from '@ant-design/icons';
import {
    Flex,
    Spin,
    Switch,
    Typography,
} from 'antd';
import type {Nullable} from 'infrastructure/common';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import {updateService} from '__services/updateService';

import {actions} from '../../actions';
import {releaseNotesModalSelector} from '../../selectors';
import {ReleaseNotesModeEnum} from '../../types';
import ReleaseNotesModal from '../release-notes-modal';

import {useUpdateSettingsView} from './hooks/useUpdateSettingsView';

const UpdateSettings = () => {
    const {isVisible: isReleaseNotesVisible} = useSelector(releaseNotesModalSelector);

    const {t} = useTranslation();

    const {
        lastCheckText,
        checkText,
        isCheckFailed,
        statusText,
        isStatusRunning,
        errorText,
        notes,
        isUpdateShown,
        isManual,
        updateText,
        currentReleaseUrl,
        latestReleaseUrl,
        isAutoUpdateEnabled,
    } = useUpdateSettingsView();

    const openReleaseNotes = (mode: ReleaseNotesModeEnum, url: Nullable<string>) => {
        actions.releaseNotesModal.setData({isVisible: true, mode, url});
    };

    return (
        <Flex
            gap={14}
            vertical
        >
            <Flex vertical>
                <Flex
                    align="center"
                    gap={14}
                    wrap
                >
                    <Typography.Text>
                        {t('settings.currentVersion', {version: process.env.APP_VERSION})}
                    </Typography.Text>

                    <EnhancedButton
                        buttonProps={{
                            type: 'link',
                            size: 'small',
                            onClick: () => openReleaseNotes(ReleaseNotesModeEnum.Current, currentReleaseUrl),
                        }}
                        withSpinner={false}
                    >
                        {t('update.whatsNew')}
                    </EnhancedButton>
                </Flex>

                <Typography.Text type="secondary">
                    {lastCheckText}
                </Typography.Text>
            </Flex>

            <Flex
                align="center"
                gap={14}
                wrap
            >
                <EnhancedButton
                    buttonProps={{
                        icon: <SyncOutlined/>,
                        onClick: () => updateService.checkForUpdates(),
                    }}
                >
                    {t('settings.checkUpdates')}
                </EnhancedButton>

                {checkText && (
                    <Typography.Text type={isCheckFailed ? 'danger' : 'secondary'}>
                        {checkText}
                    </Typography.Text>
                )}

                {isUpdateShown && latestReleaseUrl !== null && (
                    <>
                        {isManual
                            ? (
                                <EnhancedButton
                                    buttonProps={{
                                        type: 'primary',
                                        size: 'small',
                                        onClick: () => updateService.openReleasePage(latestReleaseUrl),
                                    }}
                                    withSpinner={false}
                                >
                                    {t('update.download')}
                                </EnhancedButton>
                            )
                            : (
                                <EnhancedButton
                                    buttonProps={{
                                        type: 'primary',
                                        size: 'small',
                                        onClick: updateService.install,
                                    }}
                                    withSpinner={false}
                                >
                                    {updateText}
                                </EnhancedButton>
                            )}

                        {!isManual && (
                            <EnhancedButton
                                buttonProps={{
                                    type: 'link',
                                    size: 'small',
                                    onClick: () => openReleaseNotes(ReleaseNotesModeEnum.Newer, latestReleaseUrl),
                                }}
                                withSpinner={false}
                            >
                                {t('update.whatsNew')}
                            </EnhancedButton>
                        )}
                    </>
                )}
            </Flex>

            {statusText && (
                <Flex
                    align="center"
                    gap={14}
                >
                    {isStatusRunning && <Spin size="small"/>}

                    <Typography.Text type="secondary">
                        {statusText}
                    </Typography.Text>
                </Flex>
            )}

            {errorText && (
                <Typography.Text type="danger">
                    {errorText}
                </Typography.Text>
            )}

            {notes.map(note => (
                <Typography.Text
                    key={note}
                    type="secondary"
                >
                    {note}
                </Typography.Text>
            ))}

            <Flex
                align="center"
                justify="space-between"
                gap={14}
            >
                <Flex vertical>
                    <Typography.Text>
                        {t('settings.autoUpdate')}
                    </Typography.Text>

                    <Typography.Text type="secondary">
                        {t('settings.autoUpdateHint')}
                    </Typography.Text>
                </Flex>

                <Switch
                    checked={isAutoUpdateEnabled}
                    onChange={updateService.setAutoUpdateEnabled}
                />
            </Flex>

            {isReleaseNotesVisible && <ReleaseNotesModal/>}
        </Flex>
    );
};

export default UpdateSettings;
