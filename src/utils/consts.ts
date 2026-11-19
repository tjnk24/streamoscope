import {
    MigratedSettingsDto,
    SettingsDto,
    SettingsMigrationDto,
} from '__types/app/settings';
import {LanguageEnum, ObsLanguagePrefixDto} from '__types/i18n/language';
import {ProfileParameterKeyDto} from '__types/obs/requests';
import {HealthLevelEnum, OutputViewDto} from '__types/stats/views';
import {
    PlatformRuleDto,
    PlatformSourceEnum,
    SharedPlatformRuleDto,
} from '__types/targets';
import {ThemeModeEnum} from '__types/theme';
import {UpdateStageEnum} from '__types/update/bridgeUpdate';

const {
    Ru,
    Uk,
    Es,
    De,
    Fr,
    It,
    Nl,
    Pl,
    PtBr,
    Tr,
    Vi,
    Id,
    Th,
    Ja,
    Ko,
    ZhCn,
    ZhTw,
} = LanguageEnum;

const {User, TargetTitle} = PlatformSourceEnum;

const {Preparing, Downloading, Verifying, Installing} = UpdateStageEnum;

const DEFAULT_OBS_WEBSOCKET_PORT = 4455;
export const OBS_WEBSOCKET_PROTOCOL = 'obswebsocket.json';
export const OBS_RPC_VERSION = 1;
export const AUTHENTICATION_FAILED_CLOSE_CODE = 4009;

export const POLL_INTERVAL_MS = 1000;
export const OBS_THEME_FILE_NAME = './obs-theme.js';
export const OBS_THEME_FILE_REFRESH_MS = 2000;
export const FILE_PROTOCOL = 'file:';
export const PROFILE_PARAMETER_SPACING_MS = 750;
export const REQUEST_TIMEOUT_MS = 5000;
export const RECONNECT_INTERVAL_MS = 3000;
export const RECONNECT_COUNTDOWN_TICK_MS = 250;
export const VIEW_RESUME_DELAY_MS = 300;
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
export const OBS_THEME_STORAGE_KEY = 'streamoscope.obsTheme';
export const SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS: SettingsDto = {
    settingsVersion: SETTINGS_VERSION,
    port: DEFAULT_OBS_WEBSOCKET_PORT,
    isShowGeneralCard: true,
    isShowOutputCards: true,
    language: null,
    isAutoUpdateEnabled: true,
    isJournalEnabled: true,
    lastUpdateCheckAt: null,
    lastNotifiedVersion: null,
    themeMode: ThemeModeEnum.Obs,
    isMockEnabled: false,
    cardOrder: [],
    cardPlatforms: {},
    hiddenOutputStats: [],
    hiddenGeneralStats: [],
};

export const OBS_LANGUAGE_PREFIXES: ObsLanguagePrefixDto[] = [
    {prefix: 'ru', language: Ru},
    {prefix: 'uk', language: Uk},
    {prefix: 'es', language: Es},
    {prefix: 'de', language: De},
    {prefix: 'fr', language: Fr},
    {prefix: 'it', language: It},
    {prefix: 'nl', language: Nl},
    {prefix: 'pl', language: Pl},
    {prefix: 'pt', language: PtBr},
    {prefix: 'tr', language: Tr},
    {prefix: 'vi', language: Vi},
    {prefix: 'id', language: Id},
    {prefix: 'th', language: Th},
    {prefix: 'ja', language: Ja},
    {prefix: 'ko', language: Ko},
    {prefix: 'zh-tw', language: ZhTw},
    {prefix: 'zh-hk', language: ZhTw},
    {prefix: 'zh-mo', language: ZhTw},
    {prefix: 'zh-hant', language: ZhTw},
    {prefix: 'zh', language: ZhCn},
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
        title: 'W.TV',
        color: '#ffffff',
        services: /\bw\.tv\b/i,
        hosts: [/(^|\.)w\.tv$/, /^ab2262fdd9c5\.global-contribute\.live-video\.net$/],
    },
    {
        title: 'VK Video Live',
        color: '#0077ff',
        services: /vk\s*(video\s*)?live|vk\s*play/i,
        hosts: [/^rtmp\.vkvideo\.ru$/, /(^|\.)vk\.me$/],
    },
    {
        title: 'Boosty',
        color: '#f15f2c',
        services: /boosty/i,
        hosts: [/(^|\.)boosty\.to$/],
    },
    {
        title: 'OK',
        color: '#ff7700',
        services: /ok\.ru|odnoklassniki|одноклассники/i,
        hosts: [/(^|\.)ok\.ru$/],
    },
    {
        title: 'VK Видео',
        color: '#2787f5',
        services: /\bvk\b/i,
        hosts: [/(^|\.)(vk\.com|vkvideo\.ru)$/],
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
    {
        title: 'TikTok',
        color: '#25f4ee',
        services: /tiktok/i,
        hosts: [/(^|\.)tiktok\.com$/, /(^|\.)tiktokcdn(-[a-z]+)?\.com$/],
    },
    {
        title: 'Instagram',
        color: '#e1306c',
        services: /instagram/i,
        hosts: [/(^|\.)instagram\.com$/],
    },
    {
        title: 'X',
        color: '#e7e9ea',
        services: /twitter|^x$/i,
        hosts: [/(^|\.)pscp\.tv$/],
    },
    {
        title: 'Rumble',
        color: '#85c742',
        services: /rumble/i,
        hosts: [/(^|\.)rumble\.com$/],
    },
    {
        title: 'Steam',
        color: '#66c0f4',
        services: /\bsteam\b/i,
        hosts: [/(^|\.)broadcast\.steamcontent\.com$/],
    },
    {
        title: 'GoodGame',
        color: '#52709c',
        services: /goodgame/i,
        hosts: [/(^|\.)goodgame\.ru$/],
    },
    {
        title: 'CHZZK',
        color: '#00ffa3',
        services: /chzzk/i,
        hosts: [/^global-rtmp\.lip2\.navercorp\.com$/],
    },
    {
        title: 'SOOP',
        color: '#64fbc1',
        services: /\bsoop\b/i,
        hosts: [/(^|\.)soop\.live$/],
    },
    {
        title: 'Bilibili',
        color: '#00aeec',
        services: /bilibili/i,
        hosts: [/(^|\.)bilivideo\.com$/],
    },
    {
        title: 'niconico',
        color: '#0099e5',
        services: /niconico/i,
        hosts: [/(^|\.)nicovideo\.jp$/],
    },
    {
        title: 'Nimo TV',
        color: '#622df6',
        services: /nimo\s*tv/i,
        hosts: [/(^|\.)nimo\.tv$/],
    },
    {
        title: 'Picarto',
        color: '#1da456',
        services: /picarto/i,
        hosts: [/(^|\.)picarto\.tv$/],
    },
    {
        title: 'Piczel.tv',
        color: '#2ec4c4',
        services: /piczel/i,
        hosts: [/(^|\.)piczel\.tv$/],
    },
    {
        title: 'Mixcloud',
        color: '#5000ff',
        services: /mixcloud/i,
        hosts: [/(^|\.)mixcloud\.com$/],
    },
    {
        title: 'Vaughn Live',
        color: '#1f5aa6',
        services: /vaughn/i,
        hosts: [/(^|\.)vaughnsoft\.net$/],
    },
];

export const SHARED_PLATFORM_RULE: SharedPlatformRuleDto = {
    title: 'VK/OK/Boosty',
    color: '#2787f5',
    hosts: [/(^|\.)(okcdn\.ru|mycdn\.me)$/],
    choices: [
        {
            title: 'VK Видео',
            targetTitlePattern: /(?<![\p{L}\d])(?:vk|вк|vkvideo|вконтакте|vkontakte)(?![\p{L}\d])/iu,
            otherPlatformPattern: /(?<![\p{L}\d])(?:live|life|play|лайв|лайф|плей)(?![\p{L}\d])/iu,
        },
        {
            title: 'OK',
            targetTitlePattern: /(?<![\p{L}\d])(?:ok|ок|одноклассники|odnoklassniki)(?![\p{L}\d])/iu,
            otherPlatformPattern: null,
        },
        {
            title: 'Boosty',
            targetTitlePattern: /(?<![\p{L}\d])(?:boosty|бусти)(?![\p{L}\d])/iu,
            otherPlatformPattern: null,
        },
    ],
};

export const PLATFORM_SOURCE_LABELS: Record<PlatformSourceEnum, string> = {
    [User]: 'platform chosen by user',
    [TargetTitle]: 'platform from target name',
};

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

export const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;
export const WHITE_COLOR = '#ffffff';
export const BLACK_COLOR = '#000000';
export const RGB_CHANNEL_MAX = 255;
export const LUMINANCE_CHANNEL_WEIGHTS = [0.2126, 0.7152, 0.0722];
export const LUMINANCE_LINEAR_LIMIT = 0.03928;
export const LUMINANCE_LINEAR_DIVISOR = 12.92;
export const LUMINANCE_GAMMA_OFFSET = 0.055;
export const LUMINANCE_GAMMA = 2.4;
export const CONTRAST_LUMINANCE_OFFSET = 0.05;
export const DARK_LUMINANCE_LIMIT = 0.5;
export const CONTRAST_STEPS = 20;
export const TEXT_MIN_CONTRAST = 4.5;
export const CONTROL_MIN_CONTRAST = 3;
export const GRAPHIC_MIN_CONTRAST = 2;
export const MUTED_TEXT_WEIGHT = 0.4;
export const BORDER_WEIGHT = 0.12;
export const INPUT_BORDER_WEIGHT = 0.3;
export const ELEVATED_WEIGHT = 0.5;
export const HOVER_WEIGHT = 0.3;
export const ACTIVE_WEIGHT = 0.2;
export const FIELD_HOVER_WEIGHT = 0.05;
export const DARK_SHADOW_OPACITY = 0.55;
export const LIGHT_SHADOW_OPACITY = 0.15;
export const OBS_DEFAULT_FONT_SCALE = 10;
export const OBS_MIN_FONT_SCALE = 6;
export const OBS_MAX_FONT_SCALE = 20;
