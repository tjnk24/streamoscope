import path from 'node:path';

import {ROOT_DIRECTORY} from '../packageRelease/consts.ts';

import type {BrokenFileDto, BrokenPartType} from './types/brokenRelease.ts';
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
    'srt: no',
    'paths:',
    '  all_others:',
    '',
].join('\n');

export const STAND_RTMP_SERVER = 'rtmp://127.0.0.1:1935/stand';

const STAND_USER_DIRECTORY = path.join(STAND_DIRECTORY, 'Иван Петров');

export const LOCAL_APP_DATA_DIRECTORY = path.join(STAND_USER_DIRECTORY, 'Local');

export const DATA_DIRECTORY = path.join(LOCAL_APP_DATA_DIRECTORY, 'streamoscope');

export const INSTALL_DIRECTORY = path.join(LOCAL_APP_DATA_DIRECTORY, 'Programs', 'streamoscope');

export const JOURNAL_PATH = path.join(DATA_DIRECTORY, 'logs', 'streamoscope.log');

export const JOURNAL_FORBIDDEN_TEXTS = ['rtmp://', '127.0.0.1:1935', 'Users\\', 'file:///'];

export const JOURNAL_SILENCE_MS = 3000;

export const JOURNAL_STATS_PATTERN = /STAT\s+\S+\s+kbps_avg=[1-9]\d*/;

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

export const BROKEN_DOCK_PAGE = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Broken on purpose</title></head><body><script>throw new Error("broken on purpose");</script></body></html>\n';

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

export const OPEN_SETTINGS_EXPRESSION = 'location.hash = "#/settings"';

export const OPEN_UPDATES_GROUP_EXPRESSION = '[...document.querySelectorAll(".ant-collapse-header")].find(header => header.innerText.includes("Updates"))?.click()';

export const POLL_INTERVAL_MS = 500;

export const DOCK_WAIT_MS = 60000;

export const CONNECTION_WAIT_MS = 30000;

export const CLOSE_WAIT_MS = 20000;

export const UPDATE_WAIT_MS = 120000;

export const BACKGROUND_UPDATE_WAIT_MS = 180000;

export const STREAM_WAIT_MS = 30000;

export const ROLLBACK_WAIT_MS = 45000;

export const DOCK_PICTURE_METRICS: Record<string, number | boolean> = {
    width: 420,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
};

export const SETTINGS_STORAGE_KEY = 'streamoscope.settings';

export const PASSWORD_STORAGE_KEY = 'streamoscope.password';

export const USAGE = `Usage: npm run stand -- <command>

setup                         download OBS and the RTMP server, write their settings
install                       build the current code with the test updater and install it into the stand
release <version> [--broken|--broken-loader]
                              build a signed newer release for the test server; --broken ships a dock that throws,
                              --broken-loader a bridge loader that fails while the bridge and the dock are fine
start                         start the RTMP server, the test release server and OBS
stop                          close them
status                        show the versions, the update files, the dock and the stream
stream <on|off>               start or stop the stream to the local RTMP server
update <version>              send the bridge install:<version>
open-settings                 open the settings page of the dock
evaluate <expression>         run an expression in the dock and print the result
screenshot <file.png>         save a picture of the dock
scenario                      run everything above and check the results`;
