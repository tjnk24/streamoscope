import {
    MigratedSettingsDto,
    SettingsDto,
    SettingsMigrationDto,
} from '__types/app/settings';
import {LanguageEnum, ObsLanguagePrefixDto} from '__types/i18n/language';
import {ProfileParameterKeyDto} from '__types/obs/requests';
import {HealthLevelEnum, OutputViewDto} from '__types/stats/views';
import {PlatformRuleDto} from '__types/targets';
import {UpdateStageEnum} from '__types/update/bridgeUpdate';

const {Ru, Es, De, PtBr} = LanguageEnum;

const {Preparing, Downloading, Verifying, Installing} = UpdateStageEnum;

const DEFAULT_OBS_WEBSOCKET_PORT = 4455;
export const OBS_WEBSOCKET_PROTOCOL = 'obswebsocket.json';
export const OBS_RPC_VERSION = 1;
export const AUTHENTICATION_FAILED_CLOSE_CODE = 4009;

export const POLL_INTERVAL_MS = 1000;
export const REQUEST_TIMEOUT_MS = 5000;
export const RECONNECT_INTERVAL_MS = 3000;
export const RECONNECT_COUNTDOWN_TICK_MS = 250;
export const GRAPH_SPAN_SEC = 120;
export const RECENT_WINDOW_SEC = 60;
export const DISCOVERY_EVERY_POLLS = 5;

export const BYTES_IN_GIGABYTE = 1024 ** 3;

export const BAD_DROP_SHARE = 0.01;

export const ADVICE_DELAY_MS = 3000;
export const ADVICE_CONGESTION = 0.5;
export const ADVICE_LAG_SHARE = 0.005;

export const PASSWORD_STORAGE_KEY = 'streamoscope.password';
export const SETTINGS_STORAGE_KEY = 'streamoscope.settings';
export const DISCARDED_SETTINGS_STORAGE_KEY = 'streamoscope.settings.discarded';
export const JOURNAL_STORAGE_KEY = 'streamoscope.journal';
export const SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS: SettingsDto = {
    settingsVersion: SETTINGS_VERSION,
    port: DEFAULT_OBS_WEBSOCKET_PORT,
    isShowGeneralCard: true,
    language: null,
    isAutoUpdateEnabled: true,
    isJournalEnabled: true,
    lastUpdateCheckAt: null,
    isMockEnabled: false,
};

export const OBS_LANGUAGE_PREFIXES: ObsLanguagePrefixDto[] = [
    {prefix: 'ru', language: Ru},
    {prefix: 'es', language: Es},
    {prefix: 'de', language: De},
    {prefix: 'pt', language: PtBr},
];

export const MAIN_TARGET_KEY = 'main';
export const MAIN_OUTPUT_NAMES = ['adv_stream', 'simple_stream'];
export const PLUGIN_OUTPUT_NAMES: Record<string, string> = {
    'multi-output': 'multi-rtmp',
};

export const BRIDGE_SCRIPT_NAME = 'streamoscope-bridge.lua';
export const BRIDGE_PARAMETER: ProfileParameterKeyDto = {
    parameterCategory: 'StreamoScope',
    parameterName: 'PluginOutputs',
};
export const BRIDGE_STALE_SEC = 8;
export const BRIDGE_MISSING_CHECKS = 2;
export const CONFIG_EVENT_SUBSCRIPTION = 1 << 1;
export const COLLECTION_SWITCH_TIMEOUT_MS = 15_000;

export const UPDATE_COMMAND_PARAMETER: ProfileParameterKeyDto = {
    parameterCategory: 'StreamoScope',
    parameterName: 'UpdateCommand',
};
export const OPEN_URL_COMMAND_PARAMETER: ProfileParameterKeyDto = {
    parameterCategory: 'StreamoScope',
    parameterName: 'OpenUrlCommand',
};
export const OPEN_URL_MIN_BRIDGE_VERSION = 2;

export const STUB_MIN_BRIDGE_VERSION = 6;

export const JOURNAL_LINES_PARAMETER: ProfileParameterKeyDto = {
    parameterCategory: 'StreamoScope',
    parameterName: 'JournalLines',
};
export const JOURNAL_COMMAND_PARAMETER: ProfileParameterKeyDto = {
    parameterCategory: 'StreamoScope',
    parameterName: 'JournalCommand',
};
export const JOURNAL_MIN_BRIDGE_VERSION = 5;
export const JOURNAL_LINE_SEPARATOR = '\u001f';
export const JOURNAL_FLUSH_INTERVAL_MS = 10_000;
export const JOURNAL_BATCH_MAX_LINES = 200;
export const JOURNAL_PENDING_MAX_LINES = 2000;
export const JOURNAL_RECENT_MAX_CHARS = 50_000;
export const JOURNAL_LEVEL_WIDTH = 5;
export const JOURNAL_SOURCE_WIDTH = 8;
export const JOURNAL_OTHER_TARGET_LABEL = 'Other';
export const JOURNAL_MAIN_TARGET_LABEL = 'Main';
export const FILE_URL_FOLDERS_PATTERN = /file:\/\/\/(?:[^/\r\n)'"<>|*?]+\/)*/g;
export const WINDOWS_FOLDERS_PATTERN = /(?<![A-Za-z])[A-Za-z]:[\\/](?:[^\\/\r\n'"<>|:*?]+[\\/])*/g;
export const STREAM_URL_PATTERN = /\brtmps?:\/\/[^\s'"]+/gi;
export const LINE_BREAKS_PATTERN = /\s*[\r\n]+\s*/g;
export const UPDATE_STATUS_STALE_SEC = 120;
export const RELEASES_PAGE_URL = 'https://github.com/tjnk24/streamoscope/releases';
export const UPDATE_CHECK_PERIOD_MS = 24 * 60 * 60 * 1000;
export const UPDATE_CHECK_TIMER_MS = 60 * 60 * 1000;
export const HEALTH_REPORT_DELAY_MS = 1000;

export const UNKNOWN_PLATFORM_COLOR = '#9aa0ae';

export const PLATFORM_RULES: PlatformRuleDto[] = [
    {
        title: 'YouTube',
        color: '#ff4e45',
        services: /youtube/i,
        hosts: [/(^|\.)youtube\.com$/, /(^|\.)youtu\.be$/],
    },
    {
        title: 'Twitch',
        color: '#a970ff',
        services: /twitch/i,
        hosts: [/(^|\.)twitch\.tv$/, /^ingest\.global-contribute\.live-video\.net$/, /^[a-z]{3}\d{2}\.contribute\.live-video\.net$/],
    },
    {
        title: 'Kick',
        color: '#53fc18',
        services: /kick/i,
        hosts: [/(^|\.)kick\.com$/, /^fa723fc1b171\.global-contribute\.live-video\.net$/],
    },
    {
        title: 'VK Video Live',
        color: '#0077ff',
        services: /vk\s*(video\s*)?live|vk\s*play/i,
        hosts: [/^rtmp\.vkvideo\.ru$/, /(^|\.)vk\.me$/],
    },
    {
        title: 'VK Видео',
        color: '#2787f5',
        services: /\bvk\b/i,
        hosts: [/(^|\.)(vk\.com|vkvideo\.ru|okcdn\.ru|mycdn\.me)$/],
    },
    {
        title: 'Rutube',
        color: '#00d1b2',
        services: /rutube/i,
        hosts: [/(^|\.)rutube\.ru$/],
    },
    {
        title: 'Telegram',
        color: '#2aabee',
        services: /telegram/i,
        hosts: [/(^|\.)t\.me$/],
    },
    {
        title: 'Facebook',
        color: '#1877f2',
        services: /facebook/i,
        hosts: [/(^|\.)facebook\.com$/],
    },
    {
        title: 'Trovo',
        color: '#19d65c',
        services: /trovo/i,
        hosts: [/(^|\.)trovo\.live$/],
    },
];

export const OFF_OUTPUT_VIEW: OutputViewDto = {
    isActive: false,
    isReconnecting: false,
    level: HealthLevelEnum.Off,
    kbps: null,
    timecode: '',
    dropped: 0,
    total: 0,
    recentDropped: 0,
    recentTotal: 0,
    congestion: 0,
    graph: [],
    advices: [],
};

export const FIRST_SETTINGS_VERSION = 1;

export const DISCARDED_SETTINGS: MigratedSettingsDto = {settings: DEFAULT_SETTINGS, isDiscarded: true, isChanged: true};

export const SETTINGS_MIGRATIONS: SettingsMigrationDto[] = [
    {
        fromVersion: 1,
        migrate: ({
            isAutoUpdateCheckEnabled,
            skippedUpdateVersion: _skippedUpdateVersion,
            updateRemindAt: _updateRemindAt,
            lastSeenVersion: _lastSeenVersion,
            ...settings
        }) => ({...settings, isAutoUpdateEnabled: isAutoUpdateCheckEnabled !== false}),
    },
];

export const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)/;
export const TAG_PATTERN = /^v(\d+\.\d+\.\d+)$/;
export const COMPATIBILITY_PATTERN = /<!--\s*compatibility:\s*([\s\S]*?)\s*-->/;
export const CHROMIUM_PATTERN = /Chrome\/(\d+)\./;
export const OBS_USER_AGENT_PATTERN = /\bOBS\/\d/;

export const RUNNING_UPDATE_STAGES = [
    Preparing,
    Downloading,
    Verifying,
    Installing,
];

export const FIRST_BRIDGE_VERSION = 1;

export const UPDATE_STAGES: string[] = Object.values(UpdateStageEnum);

export const HTTP_NOT_FOUND = 404;
