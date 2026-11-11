import i18n from 'i18next';
import type {Nullable} from 'infrastructure/common';

import {connectionSelector} from '__selectors/connectionSelectors';
import {settingsSelector} from '__selectors/settingsSelectors';
import {statsSelector} from '__selectors/statsSelectors';
import {getStore} from '__store';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {BYTES_IN_GIGABYTE, JOURNAL_OTHER_TARGET_LABEL} from '__utils/consts';
import {removePrivateText} from '__utils/journal/lines/removePrivateText';

import {journalService} from './journal/journalService';

class ReportService {
    buildDiagnostics = () => {
        const {hardware: {gpu, systemMemory}, targets} = statsSelector(getStore());
        const isBridgeActive = gpu !== null || systemMemory !== null;
        const memoryText = systemMemory ? `${(systemMemory.total / BYTES_IN_GIGABYTE).toFixed(1)} GB` : 'unknown';

        return [
            ...this.buildEnvironmentLines(),
            `Bridge script: ${isBridgeActive ? 'active' : 'not detected'}`,
            `GPU: ${gpu?.name ?? 'unknown'}`,
            `System memory: ${memoryText}`,
            `Time: ${new Date().toISOString()}`,
            '',
            'Outputs:',
            ...(targets.length ? targets.map(this.describeTarget) : ['- none']),
            '',
            `Journal: ${settingsSelector(getStore()).isJournalEnabled ? 'on' : 'off'}`,
            'Recent journal events:',
            ...journalService.getRecentLines(),
        ].join('\n');
    };

    buildErrorReport = (error: Error, componentStack: Nullable<string> | undefined) => [
        ...this.buildEnvironmentLines(),
        `Page: ${window.location.hash || '#/'}`,
        `Time: ${new Date().toISOString()}`,
        '',
        removePrivateText(error.stack ?? `${error.name}: ${error.message}`, false),
        '',
        'Component stack:',
        removePrivateText(componentStack?.trim() ?? '', false),
    ].join('\n');

    copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);

            return true;
        } catch {
            return false;
        }
    };

    private buildEnvironmentLines = () => {
        const {obsVersion, status} = connectionSelector(getStore());
        const buildText = process.env.BUILD_LABEL ? ` (local build ${process.env.BUILD_LABEL})` : '';

        return [
            `StreamoScope: ${process.env.APP_VERSION}${buildText}`,
            `OBS: ${obsVersion?.obsVersion ?? 'unknown'}`,
            `obs-websocket: ${obsVersion?.obsWebSocketVersion ?? 'unknown'}`,
            `Platform: ${obsVersion?.platformDescription ?? 'unknown'}`,
            `Connection: ${status}`,
            `Language: ${i18n.language}`,
            `Browser: ${navigator.userAgent}`,
        ];
    };

    private describeTarget = ({origin, outputName, pluginName, platform}: StreamTargetDto) => {
        const title = platform.isKnown ? platform.title : JOURNAL_OTHER_TARGET_LABEL;

        if (origin === OutputOriginEnum.Main) {
            return `- ${title}: main output`;
        }

        return `- ${title}: plugin output "${outputName}"${pluginName ? ` (${pluginName})` : ''}`;
    };
}

export const reportService = new ReportService();
