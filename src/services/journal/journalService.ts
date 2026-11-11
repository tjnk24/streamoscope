import type {Nullable} from 'infrastructure/common';

import {commonActions} from '__actions';
import {settingsSelector} from '__selectors/settingsSelectors';
import store, {getStore} from '__store';
import {JournalLevelEnum, JournalSnapshotDto} from '__types/journal';
import {
    JOURNAL_BATCH_MAX_LINES,
    JOURNAL_FLUSH_INTERVAL_MS,
    JOURNAL_PENDING_MAX_LINES,
    JOURNAL_RECENT_MAX_CHARS,
} from '__utils/consts';
import {isInsideObs} from '__utils/isInsideObs';
import {buildJournalSnapshot} from '__utils/journal/changes/buildJournalSnapshot';
import {describeJournalChanges} from '__utils/journal/changes/describeJournalChanges';
import {isJournalKept} from '__utils/journal/isJournalKept';
import {isJournalWritten} from '__utils/journal/isJournalWritten';
import {formatJournalLine} from '__utils/journal/lines/formatJournalLine';
import {trimJournalLines} from '__utils/journal/lines/trimJournalLines';

import {storageService} from '../storageService';

import {bridgeJournalTransport} from './bridgeJournalTransport';
import {devJournalTransport} from './devJournalTransport';

const {Info, Error} = JournalLevelEnum;

const transport = process.env.IS_DEV_SERVER ? devJournalTransport : bridgeJournalTransport;

class JournalService {
    private unsubscribe: Nullable<() => void> = null;

    private flushTimer: Nullable<number> = null;

    private snapshot: Nullable<JournalSnapshotDto> = null;

    private pendingLines: string[] = [];

    private recentLines = storageService.loadJournal();

    private wasTransportReady = false;

    start = () => {
        this.stop();

        const state = getStore();
        const buildText = process.env.BUILD_LABEL ? ` build=${process.env.BUILD_LABEL}` : '';

        this.snapshot = buildJournalSnapshot(state);
        this.log(Info, 'panel', `started version=${process.env.APP_VERSION}${buildText} language=${settingsSelector(state).language ?? 'auto'} browser=${navigator.userAgent}`);

        this.unsubscribe = store.subscribe(this.onStoreChange);
        this.flushTimer = window.setInterval(this.flush, JOURNAL_FLUSH_INTERVAL_MS);

        window.addEventListener('error', this.onWindowError);
        window.addEventListener('unhandledrejection', this.onUnhandledRejection);
        window.addEventListener('hashchange', this.onPageChange);
    };

    stop = () => {
        this.unsubscribe?.();
        this.unsubscribe = null;

        this.flushTimer !== null && window.clearInterval(this.flushTimer);
        this.flushTimer = null;

        this.wasTransportReady = false;

        window.removeEventListener('error', this.onWindowError);
        window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
        window.removeEventListener('hashchange', this.onPageChange);
    };

    log = (level: JournalLevelEnum, source: string, message: string) => {
        const {isMockEnabled, isJournalEnabled} = settingsSelector(getStore());

        if (!isJournalKept(Boolean(process.env.IS_DEV_SERVER), isMockEnabled) || !isJournalEnabled) {
            return;
        }

        const line = formatJournalLine({level, source, message}, new Date());

        this.recentLines = trimJournalLines([...this.recentLines, line], JOURNAL_RECENT_MAX_CHARS);
        storageService.saveJournal(this.recentLines);

        if (!this.isWritten()) {
            return;
        }

        this.pendingLines = [...this.pendingLines, line].slice(-JOURNAL_PENDING_MAX_LINES);

        level === Error && this.flush();
    };

    getRecentLines = () => this.recentLines;

    setEnabled = (isEnabled: boolean) => {
        if (isEnabled) {
            commonActions.settings.setIsJournalEnabled(true);
            this.isWritten() && transport.setEnabled(true);
            this.log(Info, 'user', 'turned the journal on');

            return;
        }

        this.log(Info, 'user', 'turned the journal off');
        this.flush();

        commonActions.settings.setIsJournalEnabled(false);
        this.pendingLines = [];
        this.isWritten() && transport.setEnabled(false);
    };

    openFolder = () => {
        transport.openFolder();
    };

    private isWritten = () => isJournalWritten(Boolean(process.env.IS_DEV_SERVER), settingsSelector(getStore()).isMockEnabled, isInsideObs());

    private flush = () => {
        if (!this.pendingLines.length || !transport.isReady()) {
            return;
        }

        transport.send(this.pendingLines.slice(0, JOURNAL_BATCH_MAX_LINES));

        this.pendingLines = this.pendingLines.slice(JOURNAL_BATCH_MAX_LINES);
    };

    private onStoreChange = () => {
        const state = getStore();
        const snapshot = buildJournalSnapshot(state);

        if (this.snapshot) {
            describeJournalChanges(this.snapshot, snapshot).forEach(({level, source, message}) => this.log(level, source, message));
        }

        this.snapshot = snapshot;

        const wasReady = this.wasTransportReady;

        this.wasTransportReady = transport.isReady();

        if (this.wasTransportReady && !wasReady && this.isWritten()) {
            transport.setEnabled(settingsSelector(state).isJournalEnabled);
        }
    };

    private onWindowError = ({message, filename, lineno: lineNumber, colno: columnNumber}: ErrorEvent) => {
        this.log(Error, 'panel', `uncaught error ${message} at ${filename}:${lineNumber}:${columnNumber}`);
    };

    private onUnhandledRejection = ({reason}: PromiseRejectionEvent) => {
        this.log(Error, 'panel', `unhandled rejection ${String(reason)}`);
    };

    private onPageChange = () => {
        this.log(Info, 'user', `opened page ${window.location.hash || '#/'}`);
    };
}

export const journalService = new JournalService();

import.meta.webpackHot?.decline();
