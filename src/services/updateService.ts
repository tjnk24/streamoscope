import type {Nullable} from 'infrastructure/common';
import {isHTTPError} from 'ky';

import {commonActions} from '__actions';
import {releasesApi} from '__api/github/ReleasesApi';
import {connectionSelector} from '__selectors/connectionSelectors';
import {settingsSelector} from '__selectors/settingsSelectors';
import {updateSelector} from '__selectors/updateSelectors';
import store, {getStore} from '__store';
import {JournalLevelEnum} from '__types/journal';
import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {CompatibilityResultDto} from '__types/update/compatibility';
import {UpdateInstallBlockerEnum} from '__types/update/install';
import {UpdateCheckStatusEnum} from '__types/update/UpdateCheckStatusEnum';
import {
    HEALTH_REPORT_DELAY_MS,
    HTTP_NOT_FOUND,
    OPEN_URL_COMMAND_PARAMETER,
    OPEN_URL_MIN_BRIDGE_VERSION,
    UPDATE_CHECK_PERIOD_MS,
    UPDATE_CHECK_TIMER_MS,
    UPDATE_COMMAND_PARAMETER,
} from '__utils/consts';
import {isInsideObs} from '__utils/isInsideObs';
import {checkCompatibility} from '__utils/update/checkCompatibility';
import {compareVersions} from '__utils/update/compareVersions';
import {getChromiumVersion} from '__utils/update/getChromiumVersion';
import {getInstallBlocker} from '__utils/update/getInstallBlocker';
import {parseRelease} from '__utils/update/parseRelease';

import {journalService} from './journal/journalService';
import {obsConnectionService} from './obsConnectionService';

const {Checking, UpToDate, Available, Failed} = UpdateCheckStatusEnum;

const {SetProfileParameter} = ObsRequestTypeEnum;

class UpdateService {
    private timer: Nullable<number> = null;

    private unsubscribe: Nullable<() => void> = null;

    private healthReportTimer: Nullable<number> = null;

    private hasUpdater = false;

    private hasRenderError = false;

    start = () => {
        this.stop();

        if (settingsSelector(getStore()).isAutoUpdateEnabled) {
            void this.checkForUpdates();
        }

        this.timer = window.setInterval(this.checkIfDue, UPDATE_CHECK_TIMER_MS);
        this.unsubscribe = store.subscribe(this.onStoreChange);
    };

    stop = () => {
        this.timer !== null && window.clearInterval(this.timer);
        this.timer = null;
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.hasUpdater = false;
        this.cancelHealthReport();
    };

    checkForUpdates = async (): Promise<UpdateCheckStatusEnum> => {
        commonActions.update.setCheckStatus(Checking);

        const status = await this.fetchLatest();

        commonActions.update.setCheckStatus(status);

        if (status !== Failed) {
            commonActions.settings.setLastUpdateCheckAt(Date.now());
        }

        return status;
    };

    getCompatibility = (): Nullable<CompatibilityResultDto> => {
        const state = getStore();
        const {latest} = updateSelector(state);
        const compatibility = latest?.compatibility;

        if (!compatibility) {
            return null;
        }

        const {obsVersion} = connectionSelector(state);

        return checkCompatibility(compatibility, {
            currentVersion: process.env.APP_VERSION,
            obsVersion: obsVersion?.obsVersion ?? null,
            rpcVersion: obsVersion?.rpcVersion ?? null,
            availableRequests: obsVersion?.availableRequests ?? null,
            chromiumVersion: getChromiumVersion(navigator.userAgent),
        });
    };

    getInstallBlocker = (): Nullable<UpdateInstallBlockerEnum> => {
        const {latest, bridge} = updateSelector(getStore());

        return getInstallBlocker({
            release: latest,
            currentVersion: process.env.APP_VERSION,
            bridge,
            compatibility: this.getCompatibility(),
            now: Date.now(),
        });
    };

    install = () => {
        const {latest: release} = updateSelector(getStore());

        if (this.getInstallBlocker() || !release) {
            return;
        }

        journalService.log(JournalLevelEnum.Info, 'user', `clicked update version=${release.version}`);

        obsConnectionService.sendRequest({
            requestType: SetProfileParameter,
            requestData: {...UPDATE_COMMAND_PARAMETER, parameterValue: `install:${release.version}`},
        });

        commonActions.update.setRequest({version: release.version, requestedAt: Date.now()});
    };

    openReleasePage = (url: string) => {
        const state = getStore();
        const {bridge} = updateSelector(state);

        if (settingsSelector(state).isMockEnabled || !bridge || bridge.bridgeVersion < OPEN_URL_MIN_BRIDGE_VERSION) {
            window.open(url, '_blank', 'noreferrer');

            return;
        }

        obsConnectionService.sendRequest({
            requestType: SetProfileParameter,
            requestData: {...OPEN_URL_COMMAND_PARAMETER, parameterValue: url},
        });
    };

    setAutoUpdateEnabled = (isEnabled: boolean) => {
        commonActions.settings.setIsAutoUpdateEnabled(isEnabled);
        this.sendAutoUpdate();
        isEnabled && this.checkIfDue();
    };

    reportRenderError = () => {
        this.hasRenderError = true;
        this.cancelHealthReport();
    };

    private cancelHealthReport = () => {
        this.healthReportTimer !== null && window.clearTimeout(this.healthReportTimer);
        this.healthReportTimer = null;
    };

    private scheduleHealthReport = () => {
        this.cancelHealthReport();

        if (this.hasRenderError || process.env.IS_DEV_SERVER || !isInsideObs()) {
            return;
        }

        this.healthReportTimer = window.setTimeout(this.sendHealthReport, HEALTH_REPORT_DELAY_MS);
    };

    private sendHealthReport = () => {
        obsConnectionService.sendRequest({
            requestType: SetProfileParameter,
            requestData: {...UPDATE_COMMAND_PARAMETER, parameterValue: `healthy:${process.env.APP_VERSION}`},
        });
    };

    private sendAutoUpdate = () => {
        const {isAutoUpdateEnabled} = settingsSelector(getStore());

        obsConnectionService.sendRequest({
            requestType: SetProfileParameter,
            requestData: {...UPDATE_COMMAND_PARAMETER, parameterValue: `auto:${isAutoUpdateEnabled ? 'on' : 'off'}`},
        });
    };

    private fetchLatest = async (): Promise<UpdateCheckStatusEnum> => {
        try {
            const release = parseRelease(await releasesApi.getLatest());

            commonActions.update.setLatest(release);

            return release && (compareVersions(release.version, process.env.APP_VERSION) ?? 0) > 0
                ? Available
                : UpToDate;
        } catch (error) {
            if (isHTTPError(error) && error.response.status === HTTP_NOT_FOUND) {
                commonActions.update.setLatest(null);

                return UpToDate;
            }

            return Failed;
        }
    };

    private checkIfDue = () => {
        const {isAutoUpdateEnabled, lastUpdateCheckAt} = settingsSelector(getStore());

        if (isAutoUpdateEnabled && (lastUpdateCheckAt === null || Date.now() - lastUpdateCheckAt >= UPDATE_CHECK_PERIOD_MS)) {
            void this.checkForUpdates();
        }
    };

    private onStoreChange = () => {
        const hadUpdater = this.hasUpdater;

        this.hasUpdater = updateSelector(getStore()).bridge?.isAvailable === true;

        if (this.hasUpdater && !hadUpdater) {
            this.sendAutoUpdate();
            this.scheduleHealthReport();
        }
    };
}

export const updateService = new UpdateService();

import.meta.webpackHot?.decline();
