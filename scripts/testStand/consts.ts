import path from 'node:path';

import {ROOT_DIRECTORY} from '../packageRelease/consts.ts';

import type {BrokenFileDto, BrokenPartType} from './types/brokenRelease.ts';
import type {MultiRtmpConfigDto, MultiRtmpVideoParamDto} from './types/rtmp.ts';
import type {ScenarioVersionsDto} from './types/ScenarioVersionsDto.ts';
import type {StandArchiveDto} from './types/StandArchiveDto.ts';

export const STAND_DIRECTORY = path.join(ROOT_DIRECTORY, '.test-stand');

export const DOWNLOADS_DIRECTORY = path.join(STAND_DIRECTORY, 'downloads');

export const WINDOWS_TAR = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe');

export const POWERSHELL_ARGUMENTS = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass'];

const OBS_VERSION = '33.0.1';

export const OBS_ARCHIVE: StandArchiveDto = {
    name: `OBS-Studio-${OBS_VERSION}-Windows-x64.zip`,
    url: `https://github.com/obsproject/obs-studio/releases/download/${OBS_VERSION}/OBS-Studio-${OBS_VERSION}-Windows-x64.zip`,
    sha256: '0d9436451c2d772b33428e3fdae9776f071895c335de17283176306fb72651d3',
};

const MEDIAMTX_VERSION = 'v1.21.3';

export const MEDIAMTX_ARCHIVE: StandArchiveDto = {
    name: `mediamtx_${MEDIAMTX_VERSION}_windows_amd64.zip`,
    url: `https://github.com/bluenviron/mediamtx/releases/download/${MEDIAMTX_VERSION}/mediamtx_${MEDIAMTX_VERSION}_windows_amd64.zip`,
    sha256: 'b2f5246b07cb72961df03b8d5e8cad43dc657bcf3f49a87bb031bdf22721af74',
};

export const LUA_DIRECTORY = path.join(STAND_DIRECTORY, 'lua');

export const LUA_LIBRARY_IN_ARCHIVE = 'bin/64bit/lua51.dll';

export const LUA_LIBRARY_PATH = path.join(LUA_DIRECTORY, 'bin', '64bit', 'lua51.dll');

export const OBS_DIRECTORY = path.join(STAND_DIRECTORY, `obs-${OBS_VERSION}`);

export const OBS_BIN_DIRECTORY = path.join(OBS_DIRECTORY, 'bin', '64bit');

export const OBS_EXECUTABLE = path.join(OBS_BIN_DIRECTORY, 'obs64.exe');

export const OBS_CONFIG_DIRECTORY = path.join(OBS_DIRECTORY, 'config', 'obs-studio');

export const OBS_LOGS_DIRECTORY = path.join(OBS_CONFIG_DIRECTORY, 'logs');

export const OBS_LOADED_LOG_TEXT = 'Loaded scenes:';

export const OBS_WEBSOCKET_CONFIG_PATH = path.join(OBS_CONFIG_DIRECTORY, 'plugin_config', 'obs-websocket', 'config.json');

export const OBS_PORTABLE_MARKER = path.join(OBS_DIRECTORY, 'portable_mode.txt');

export const OBS_VERSION_NUMBER = 553648129;

export const UTF8_BOM = String.fromCharCode(0xFEFF);

export const STAND_COLLECTION_NAME = 'Stand';

export const STAND_WEBSOCKET_PORT = 4466;

export const STAND_DEBUG_PORT = 9223;

export const OBS_ARGUMENTS = [
    '--portable',
    '--multi',
    '--disable-updater',
    '--disable-shutdown-check',
    '--disable-missing-files-check',
    `--remote-debugging-port=${STAND_DEBUG_PORT}`,
    '--remote-allow-origins=*',
];

export const MEDIAMTX_DIRECTORY = path.join(STAND_DIRECTORY, `mediamtx-${MEDIAMTX_VERSION}`);

export const MEDIAMTX_EXECUTABLE = path.join(MEDIAMTX_DIRECTORY, 'mediamtx.exe');

export const MEDIAMTX_CONFIG_PATH = path.join(MEDIAMTX_DIRECTORY, 'stand.yml');

export const MEDIAMTX_PATHS_URL = 'http://127.0.0.1:9997/v3/paths/list';

export const MULTI_RTMP_KEY_PREFIX = 'stand-multi-key-';

const MULTI_RTMP_SRT_PATH = 'multi/srt';

const MULTI_RTMP_SRT_PASSPHRASE = `${MULTI_RTMP_KEY_PREFIX}srt`;

export const MULTI_RTMP_SRT_SERVER_ORIGIN = 'srt://127.0.0.1:8890';

const MULTI_RTMP_SRT_SERVER = `${MULTI_RTMP_SRT_SERVER_ORIGIN}?streamid=publish:${MULTI_RTMP_SRT_PATH}&passphrase=${MULTI_RTMP_SRT_PASSPHRASE}&pkt_size=1316`;

export const MULTI_RTMP_SRT_TITLE = 'Stand SRT';

export const MEDIAMTX_CONFIG = [
    'logLevel: warn',
    'logDestinations: [stdout]',
    'api: yes',
    'apiAddress: 127.0.0.1:9997',
    'rtmp: yes',
    'rtmpAddress: 127.0.0.1:1935',
    'rtsp: no',
    'hls: no',
    'webrtc: no',
    'srt: yes',
    'srtAddress: 127.0.0.1:8890',
    'paths:',
    `  ${MULTI_RTMP_SRT_PATH}:`,
    `    srtPublishPassphrase: ${MULTI_RTMP_SRT_PASSPHRASE}`,
    '  all_others:',
    '',
].join('\n');

export const STAND_RTMP_SERVER = 'rtmp://127.0.0.1:1935/stand';

export const STAND_STREAM_KEY = 'stand';

export const STAND_MAIN_BITRATE = 800;

export const MULTI_RTMP_VERSION = '0.7.4.5';

export const MULTI_RTMP_ARCHIVE: StandArchiveDto = {
    name: `obs-multi-rtmp-${MULTI_RTMP_VERSION}-windows-x64.zip`,
    url: `https://github.com/sorayuki/obs-multi-rtmp/releases/download/${MULTI_RTMP_VERSION}/obs-multi-rtmp-${MULTI_RTMP_VERSION}-windows-x64.zip`,
    sha256: '5ddff9bedf9cf09534db6157a5c01f5eb0115ada042ad0c3fefb7ddc1e9af801',
};

export const MULTI_RTMP_LATEST_RELEASE_URL = 'https://api.github.com/repos/sorayuki/obs-multi-rtmp/releases/latest';

export const MULTI_RTMP_BINARY_DIRECTORY = path.join(OBS_DIRECTORY, 'obs-plugins');

export const MULTI_RTMP_DATA_DIRECTORY = path.join(OBS_DIRECTORY, 'data', 'obs-plugins', 'obs-multi-rtmp');

export const MULTI_RTMP_PLUGIN_LIBRARY = path.join(MULTI_RTMP_BINARY_DIRECTORY, '64bit', 'obs-multi-rtmp.dll');

export const MULTI_RTMP_FAKE_FLAG = '--fake-multi-rtmp';

export const MULTI_RTMP_LOADED_TEXT = `[obs-multi-rtmp] version: ${MULTI_RTMP_VERSION} `;

export const MULTI_RTMP_CONFIG_LOADED_PATTERN = /\[obs-multi-rtmp\] Load (\d+) targets, (\d+) video configs/;

export const JOURNAL_MULTI_RTMP_UNREADABLE_TEXT = 'obs-multi-rtmp settings not understood';

export const FAKE_MULTI_RTMP_SCRIPT_PATH = path.join(ROOT_DIRECTORY, 'scripts', 'testStand', 'multiRtmp', 'fake-multi-rtmp.lua');

export const MULTI_RTMP_PATH_PREFIX = 'multi/';

const MULTI_RTMP_SERVER = 'rtmp://127.0.0.1:1935/multi';

export const MULTI_RTMP_MAIN_COPY_TITLE = 'Stand copy of main';

export const MULTI_RTMP_CONFIG_PATH = path.join(OBS_CONFIG_DIRECTORY, 'basic', 'profiles', STAND_COLLECTION_NAME, 'obs-multi-rtmp.json');

const MULTI_RTMP_VIDEO_ENCODER = 'obs_x264';

const MULTI_RTMP_VIDEO_PARAM: Omit<MultiRtmpVideoParamDto, 'bitrate'> = {
    rate_control: 'CBR',
    preset: 'ultrafast',
    keyint_sec: 2,
};

export const MULTI_RTMP_CONFIG: MultiRtmpConfigDto = {
    targets: [
        {
            'id': '1',
            'name': 'Stand low',
            'enabled': true,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'RTMP',
            'service-param': {server: MULTI_RTMP_SERVER, key: `${MULTI_RTMP_KEY_PREFIX}0`},
            'video-config': 'video-400',
        },
        {
            'id': '2',
            'name': 'Stand middle',
            'enabled': true,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'RTMP',
            'service-param': {server: MULTI_RTMP_SERVER, key: `${MULTI_RTMP_KEY_PREFIX}1`},
            'video-config': 'video-800',
        },
        {
            'id': '3',
            'name': 'Stand high',
            'enabled': true,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'RTMP',
            'service-param': {server: MULTI_RTMP_SERVER, key: `${MULTI_RTMP_KEY_PREFIX}2`},
            'video-config': 'video-1200',
        },
        {
            'id': '5',
            'name': MULTI_RTMP_MAIN_COPY_TITLE,
            'enabled': true,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'RTMP',
            'service-param': {server: MULTI_RTMP_SERVER, key: STAND_STREAM_KEY},
            'video-config': 'video-400',
        },
        {
            'id': '6',
            'name': MULTI_RTMP_SRT_TITLE,
            'enabled': true,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'SRT_RIST',
            'service-param': {server: MULTI_RTMP_SRT_SERVER, key: ''},
            'video-config': 'video-800',
        },
        {
            'id': '4',
            'name': 'Stand switched off',
            'enabled': false,
            'sync-start': true,
            'sync-stop': true,
            'protocol': 'RTMP',
            'service-param': {server: MULTI_RTMP_SERVER, key: `${MULTI_RTMP_KEY_PREFIX}3`},
            'video-config': 'video-400',
        },
    ],
    video_configs: [
        {
            id: 'video-400',
            encoder: MULTI_RTMP_VIDEO_ENCODER,
            param: {...MULTI_RTMP_VIDEO_PARAM, bitrate: 400},
        },
        {
            id: 'video-800',
            encoder: MULTI_RTMP_VIDEO_ENCODER,
            param: {...MULTI_RTMP_VIDEO_PARAM, bitrate: 800},
        },
        {
            id: 'video-1200',
            encoder: MULTI_RTMP_VIDEO_ENCODER,
            param: {...MULTI_RTMP_VIDEO_PARAM, bitrate: 1200},
        },
    ],
};

export const MULTI_RTMP_ENABLED_TARGETS = MULTI_RTMP_CONFIG.targets.filter(({enabled}) => enabled);

export const PLUGIN_BITRATE_TOLERANCE = 0.35;

export const BRIDGE_PARAMETER: Record<string, string> = {
    parameterCategory: 'StreamoScope',
    parameterName: 'PluginOutputs',
};

export const OUTPUT_FINGERPRINT_PATTERN = /^[0-9a-f]{8}$/;

const STAND_USER_DIRECTORY = path.join(STAND_DIRECTORY, 'Иван Петров');

export const LOCAL_APP_DATA_DIRECTORY = path.join(STAND_USER_DIRECTORY, 'Local');

export const DATA_DIRECTORY = path.join(LOCAL_APP_DATA_DIRECTORY, 'streamoscope');

export const INSTALL_DIRECTORY = path.join(LOCAL_APP_DATA_DIRECTORY, 'Programs', 'streamoscope');

export const JOURNAL_PATH = path.join(DATA_DIRECTORY, 'logs', 'streamoscope.log');

export const JOURNAL_FORBIDDEN_TEXTS = ['rtmp://', 'srt://', '127.0.0.1:1935', '127.0.0.1:8890', 'Users\\', 'file:///'];

export const JOURNAL_SILENCE_MS = 3000;

export const JOURNAL_STATS_PATTERN = /STAT\s+\S+\s+kbps_avg=[1-9]\d*/;

export const JOURNAL_DOCK_REPORT_PATTERN = /updater\s+dock reported healthy version=\S+ after_loading=\d+s/;

export const JOURNAL_OUTPUT_ID_STATS_PATTERN = /STAT\s+multi-output@([0-9a-f]{8})\s+kbps_avg=[1-9]/g;

export const JOURNAL_OBS_STATS_PATTERN = /STAT\s+OBS\s+fps=\d+\.\d frame_ms=\d+\.\d render_lag=\d+ encoder_lag=\d+ cpu=\d+\.\d% memory_mb=[1-9]/;

const UPDATE_STATUS_PATH = path.join(DATA_DIRECTORY, 'update-status.json');

export const UPDATE_CHECK_STAMP_PATH = path.join(DATA_DIRECTORY, 'update-check.stamp');

export const CURRENT_VERSION_PATH = path.join(INSTALL_DIRECTORY, 'current-version.js');

export const TRIAL_PATH = path.join(INSTALL_DIRECTORY, 'update-trial.txt');

export const HEALTHY_VERSION_PATH = path.join(INSTALL_DIRECTORY, 'healthy-version.txt');

export const HEALTHY_PROCESS_PATH = path.join(INSTALL_DIRECTORY, 'healthy-process.txt');

export const HEALTHY_LOADER_PATH = path.join(INSTALL_DIRECTORY, 'healthy-loader.txt');

export const ROLLED_BACK_VERSION_PATH = path.join(INSTALL_DIRECTORY, 'rolled-back-version.txt');

export const INSTALL_STATE_FILES = [
    CURRENT_VERSION_PATH,
    TRIAL_PATH,
    HEALTHY_VERSION_PATH,
    HEALTHY_PROCESS_PATH,
    ROLLED_BACK_VERSION_PATH,
    UPDATE_STATUS_PATH,
];

export const TEST_KEY_DIRECTORY = path.join(STAND_DIRECTORY, 'test-key');

export const TEST_SECRET_KEY_PATH = path.join(TEST_KEY_DIRECTORY, 'test.key');

export const TEST_PUBLIC_KEY_PATH = path.join(TEST_KEY_DIRECTORY, 'test.pub');

export const SERVED_DIRECTORY = path.join(STAND_DIRECTORY, 'served');

const TEST_BUILDS_DIRECTORY = path.join(path.dirname(ROOT_DIRECTORY), 'streamoscope-test-builds');

export const TEST_BUILDS_CACHE_DIRECTORY = path.join(TEST_BUILDS_DIRECTORY, 'webpack-cache');

export const PROJECT_COPY_DIRECTORY = path.join(TEST_BUILDS_DIRECTORY, 'project-copy');

export const PROJECT_COPY_SKIPPED_NAMES = ['build', 'node_modules', 'release'];

export const SERVE_RELEASE_SCRIPT = path.join(ROOT_DIRECTORY, 'scripts', 'serveTestRelease', 'index.ts');

export const REGISTRY_KEY_PATTERN = /\$script:UninstallRegistryKey = '[^']*'/;

export const STAND_REGISTRY_KEY_LINE = '$script:UninstallRegistryKey = \'HKCU:\\Software\\StreamoScopeTestStandMissing\'';

const BROKEN_DOCK_PAGE = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Broken on purpose</title></head><body><script>throw new Error("broken on purpose");</script></body></html>\n';

const BROKEN_LOADER_SOURCE = 'local broken_on_purpose = nil\nbroken_on_purpose()\n';

export const BROKEN_PART_FILES: Record<BrokenPartType, BrokenFileDto> = {
    dock: {
        relativePath: path.join('dock', 'index.html'),
        content: BROKEN_DOCK_PAGE,
    },
    loader: {
        relativePath: 'streamoscope-bridge.lua',
        content: BROKEN_LOADER_SOURCE,
    },
};

export const BROKEN_PART_FLAGS: Record<string, BrokenPartType | undefined> = {
    '--broken': 'dock',
    '--broken-loader': 'loader',
};

export const CURRENT_VERSION_TEMPLATE = 'window.STREAMOSCOPE_VERSION = \'{version}\';\r\n';

export const FIND_STAND_PROCESSES_SCRIPT = `
$stand = $env:STAND_DIRECTORY + '\\*'
Get-CimInstance Win32_Process |
    Where-Object { ($_.ExecutablePath -like $stand) -or ($_.CommandLine -like '*serveTestRelease*' -and $_.Name -eq 'node.exe') } |
    ForEach-Object { '{0} {1}' -f $_.ProcessId, $_.Name }
`;

export const OBS_PROCESS_NAME = 'obs64.exe';

export const SCENARIO_VERSIONS: ScenarioVersionsDto = {
    button: '9.0.0',
    broken: '9.0.1',
    background: '9.0.2',
    brokenLoader: '9.0.3',
};

export const OBS_HELLO_OP = 0;

export const OBS_IDENTIFY_OP = 1;

export const OBS_IDENTIFIED_OP = 2;

export const OBS_REQUEST_OP = 6;

export const OBS_REQUEST_RESPONSE_OP = 7;

export const OBS_RPC_VERSION = 1;

export const DOCK_CONNECTED_TEXT = 'OBS connected';

export const DOCK_OFFLINE_TEXT = 'Offline';

export const LIVE_BITRATE_PATTERN = /Live\s+[1-9]\d*\s+kbps/;

export const DOCK_SAME_NAME_WARNING_TEXT = 'so only one of them has stats';

export const DOCK_SAME_KEY_WARNING_TEXT = 'already taken by the main OBS stream';

export const DOCK_WAITING_FOR_FIRST_STREAM_TEXT = 'Statistics will appear as soon as you start your streams.';

export const DOCK_WAITING_FOR_STREAM_TEXT = 'Statistics will appear when you start streaming to this platform.';

export const CARD_BITRATES_EXPRESSION = '[...document.querySelectorAll(".ant-statistic-content-value")].map(value => Number(value.innerText.replace(/\\D/g, ""))).filter(Boolean)';

export const OPEN_SETTINGS_EXPRESSION = 'location.hash = "#/settings"';

export const OPEN_UPDATES_GROUP_EXPRESSION = '[...document.querySelectorAll(".ant-collapse-header")].find(header => header.innerText.includes("Updates"))?.click()';

export const POLL_INTERVAL_MS = 500;

export const DOCK_WAIT_MS = 60000;

export const CONNECTION_WAIT_MS = 30000;

export const CLOSE_WAIT_MS = 20000;

export const UPDATE_WAIT_MS = 120000;

export const BACKGROUND_UPDATE_WAIT_MS = 180000;

export const STREAM_WAIT_MS = 30000;

export const ROLLBACK_WAIT_MS = 120000;

export const SLOW_DOCK_DELAY_MS = 12000;

export const DOCK_LOADER_VERSION_LINE = 'document.head.appendChild(versionScript);';

export const SETTINGS_STORAGE_KEY = 'streamoscope.settings';

export const PASSWORD_STORAGE_KEY = 'streamoscope.password';

export const USAGE = `Usage: npm run stand -- <command>

setup [--fake-multi-rtmp]     download OBS, the RTMP server and obs-multi-rtmp, write their settings;
                              --fake-multi-rtmp or a failed download puts the stand script fake-multi-rtmp.lua in its place
install                       build the current code with the test updater and install it into the stand
release <version> [--broken|--broken-loader]
                              build a signed newer release for the test server; --broken ships a dock that throws,
                              --broken-loader a bridge loader that fails while the bridge and the dock are fine
start                         start the RTMP server, the test release server and OBS
stop                          close them
status                        show the versions, the update files, the dock and the stream
stream <on|off>               start or stop the stream to the local RTMP server, the obs-multi-rtmp targets follow it
update <version>              send the bridge install:<version>
open-settings                 open the settings page of the dock
evaluate <expression>         run an expression in the dock and print the result
screenshot <file.png>         save a picture of the dock
check-plugin                  compare the pinned obs-multi-rtmp with its latest release on GitHub
scenario [--fake-multi-rtmp]  run everything above and check the results`;
