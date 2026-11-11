import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {settingsSelector} from '__selectors/settingsSelectors';
import {updateSelector} from '__selectors/updateSelectors';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';
import {BRIDGE_SCRIPT_NAME, RELEASES_PAGE_URL} from '__utils/consts';
import {compareVersions} from '__utils/update/compareVersions';

import {LAST_CHECK_FORMAT, UPDATE_CHECK_TEXTS} from '../consts';
import {UpdateSettingsViewDto} from '../types';
import {isInstallerNeeded} from '../utils/isInstallerNeeded';

import {useUpdateNotes} from './useUpdateNotes';
import {useUpdateProgress} from './useUpdateProgress';

const {Available, Failed} = UpdateCheckStatusEnum;

export const useUpdateSettingsView = (): UpdateSettingsViewDto => {
    const {checkStatus, latest, bridge} = useSelector(updateSelector);
    const {lastUpdateCheckAt, isAutoUpdateEnabled} = useSelector(settingsSelector);

    const {t, i18n} = useTranslation();

    const {
        statusKey,
        errorKey,
        isRunning,
        isStaged,
        version,
        percent,
    } = useUpdateProgress();

    const {notes, isManual} = useUpdateNotes();

    const currentVersion = process.env.APP_VERSION;

    const isNewer = latest !== null && (compareVersions(latest.version, currentVersion) ?? 0) > 0;

    const isUpdateShown = isNewer && !isStaged && !isRunning;

    const checkTextKey = isStaged && checkStatus === Available ? null : UPDATE_CHECK_TEXTS[checkStatus];

    const lastCheckText = lastUpdateCheckAt === null
        ? t('settings.neverChecked')
        : t('settings.lastCheck', {date: new Intl.DateTimeFormat(i18n.language, LAST_CHECK_FORMAT).format(lastUpdateCheckAt)});

    return {
        lastCheckText,
        checkText: checkTextKey && t(checkTextKey, {version: latest?.version}),
        isCheckFailed: checkStatus === Failed,
        statusText: statusKey && t(statusKey, {version, percent}),
        isStatusRunning: isRunning,
        errorText: errorKey && t(errorKey, {script: BRIDGE_SCRIPT_NAME, version}),
        notes: isUpdateShown ? notes : [],
        isUpdateShown,
        isManual,
        updateText: t(errorKey ? 'update.retry' : 'update.install'),
        currentReleaseUrl: `${RELEASES_PAGE_URL}/tag/v${currentVersion}`,
        latestReleaseUrl: latest?.url ?? null,
        isAutoUpdateEnabled,
        isInstallerNeeded: isInstallerNeeded(bridge),
        installerUrl: `${RELEASES_PAGE_URL}/latest`,
    };
};
