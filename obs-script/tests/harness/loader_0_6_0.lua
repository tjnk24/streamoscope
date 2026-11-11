local ffi = require('ffi')

local obs = obslua

local CP_UTF8 = 65001
local GENERIC_READ = 0x80000000
local GENERIC_WRITE = 0x40000000
local FILE_SHARE_READ_WRITE_DELETE = 0x00000007
local OPEN_EXISTING = 3
local CREATE_ALWAYS = 2
local MOVEFILE_REPLACE_EXISTING = 1
local INVALID_HANDLE_VALUE = ffi.cast('void *', -1)
local MAX_SOURCE_BYTES = 1024 * 1024
local MODULE_PREFIX = 'streamoscope-bridge.'
local MAIN_MODULE = 'streamoscope-bridge.main'
local MAIN_MODULE_PATH = 'streamoscope-bridge/main.lua'
local CURRENT_VERSION_FILE = 'current-version.js'
local CURRENT_VERSION_TEMPLATE = "window.STREAMOSCOPE_VERSION = '%s';\r\n"
local VERSION_PATTERN = '%d+%.%d+%.%d+'
local TRIAL_FILE = 'update-trial.txt'
local TRIAL_TEMPLATE = 'version=%s\r\nprevious=%s\r\npanel=%s\r\nprocess=%d\r\nlaunches=%d\r\n'
local TRIAL_MAX_LAUNCHES = 2
local TRIAL_VERDICT_DELAY_SEC = 5
local TRIAL_VERDICT_FALLBACK_SEC = 30
local TRIAL_CHECK_INTERVAL_MS = 1000
local ROLLED_BACK_FILE = 'rolled-back-version.txt'

pcall(ffi.cdef, 'int MultiByteToWideChar(uint32_t codePage, uint32_t flags, const char *text, int length, uint16_t *buffer, int bufferLength);')
pcall(ffi.cdef, 'void *CreateFileW(const uint16_t *path, uint32_t access, uint32_t shareMode, void *security, uint32_t disposition, uint32_t flags, void *template);')
pcall(ffi.cdef, 'int ReadFile(void *file, void *buffer, uint32_t bytesToRead, uint32_t *bytesRead, void *overlapped);')
pcall(ffi.cdef, 'int WriteFile(void *file, const void *buffer, uint32_t bytesToWrite, uint32_t *bytesWritten, void *overlapped);')
pcall(ffi.cdef, 'int DeleteFileW(const uint16_t *path);')
pcall(ffi.cdef, 'int MoveFileExW(const uint16_t *source, const uint16_t *target, uint32_t flags);')
pcall(ffi.cdef, 'int CloseHandle(void *handle);')
pcall(ffi.cdef, 'uint32_t GetCurrentProcessId(void);')

local function to_wide(text)
    local length = ffi.C.MultiByteToWideChar(CP_UTF8, 0, text, -1, nil, 0)
    local buffer = ffi.new('uint16_t[?]', math.max(length, 1))

    ffi.C.MultiByteToWideChar(CP_UTF8, 0, text, -1, buffer, length)

    return buffer
end

local function read_file(path)
    local file = ffi.C.CreateFileW(to_wide(path), GENERIC_READ, FILE_SHARE_READ_WRITE_DELETE, nil, OPEN_EXISTING, 0, nil)

    if file == INVALID_HANDLE_VALUE then
        return nil
    end

    local buffer = ffi.new('uint8_t[?]', MAX_SOURCE_BYTES)
    local bytes_read = ffi.new('uint32_t[1]')
    local succeeded = ffi.C.ReadFile(file, buffer, MAX_SOURCE_BYTES, bytes_read, nil)

    ffi.C.CloseHandle(file)

    return succeeded ~= 0 and ffi.string(buffer, bytes_read[0]) or nil
end

local function write_file(path, text)
    local file = ffi.C.CreateFileW(to_wide(path), GENERIC_WRITE, FILE_SHARE_READ_WRITE_DELETE, nil, CREATE_ALWAYS, 0, nil)

    if file == INVALID_HANDLE_VALUE then
        return
    end

    local bytes_written = ffi.new('uint32_t[1]')

    ffi.C.WriteFile(file, text, #text, bytes_written, nil)
    ffi.C.CloseHandle(file)
end

local install_root = script_path()
local current_version = string.match(read_file(install_root .. CURRENT_VERSION_FILE) or '', VERSION_PATTERN)

local function version_root(version)
    return install_root .. 'versions/' .. version .. '/'
end

local bridge_root = current_version ~= nil and version_root(current_version) or install_root

function script_path()
    return bridge_root
end

local function remove_trial()
    ffi.C.DeleteFileW(to_wide(install_root .. TRIAL_FILE))
end

local function read_trial()
    local text = read_file(install_root .. TRIAL_FILE) or ''
    local trial = {
        version = string.match(text, 'version=(' .. VERSION_PATTERN .. ')'),
        previous = string.match(text, 'previous=(' .. VERSION_PATTERN .. ')'),
        panel = string.match(text, 'panel=(%d)'),
        process = tonumber(string.match(text, 'process=(%d+)')),
        launches = tonumber(string.match(text, 'launches=(%d+)')),
    }

    if trial.version == nil or trial.previous == nil or trial.panel == nil or trial.process == nil or trial.launches == nil then
        return nil
    end

    return trial
end

local function switch_back(trial)
    if read_file(version_root(trial.previous) .. MAIN_MODULE_PATH) == nil then
        return false
    end

    local current_version_path = install_root .. CURRENT_VERSION_FILE
    local temporary_path = current_version_path .. '.tmp'

    write_file(temporary_path, string.format(CURRENT_VERSION_TEMPLATE, trial.previous))
    ffi.C.MoveFileExW(to_wide(temporary_path), to_wide(current_version_path), MOVEFILE_REPLACE_EXISTING)
    write_file(install_root .. ROLLED_BACK_FILE, trial.version)
    remove_trial()

    return true
end

local function finish_silent_trial(trial)
    if trial.panel ~= '1' or not switch_back(trial) then
        remove_trial()

        return false
    end

    return true
end

local function open_trial()
    if current_version == nil then
        return nil, false
    end

    local trial = read_trial()

    if trial == nil or trial.version ~= current_version then
        remove_trial()

        return nil, false
    end

    local process_id = tonumber(ffi.C.GetCurrentProcessId())

    if process_id == trial.process then
        return trial, false
    end

    if trial.launches >= TRIAL_MAX_LAUNCHES then
        if finish_silent_trial(trial) then
            bridge_root = version_root(trial.previous)
        end

        return nil, false
    end

    write_file(install_root .. TRIAL_FILE, string.format(TRIAL_TEMPLATE, trial.version, trial.previous, trial.panel, process_id, trial.launches + 1))

    return trial, true
end

local function watch_trial(trial)
    local started_at = os.time()
    local finished_loading_at = nil

    local function check_trial()
        local now = os.time()
        local is_loaded_long_enough = finished_loading_at ~= nil and now - finished_loading_at >= TRIAL_VERDICT_DELAY_SEC

        if not is_loaded_long_enough and now - started_at < TRIAL_VERDICT_FALLBACK_SEC then
            return
        end

        obs.timer_remove(check_trial)

        local open = read_trial()

        if open ~= nil and open.version == trial.version then
            finish_silent_trial(open)
        end
    end

    obs.obs_frontend_add_event_callback(function(event)
        if event == obs.OBS_FRONTEND_EVENT_FINISHED_LOADING then
            finished_loading_at = os.time()
        end
    end)

    obs.timer_add(check_trial, TRIAL_CHECK_INTERVAL_MS)
end

table.insert(package.loaders, 2, function(module_name)
    if string.sub(module_name, 1, #MODULE_PREFIX) ~= MODULE_PREFIX then
        return nil
    end

    local module_path = bridge_root .. string.gsub(module_name, '%.', '/') .. '.lua'
    local source = read_file(module_path)

    return source ~= nil and assert(loadstring(source, '@' .. module_path)) or nil
end)

local trial, is_new_launch = open_trial()
local is_loaded, load_error = pcall(require, MAIN_MODULE)

if not is_loaded then
    if trial == nil or not switch_back(trial) then
        error(load_error, 0)
    end

    bridge_root = version_root(trial.previous)
    trial = nil
    is_new_launch = false

    for module_name in pairs(package.loaded) do
        if string.sub(module_name, 1, #MODULE_PREFIX) == MODULE_PREFIX then
            package.loaded[module_name] = nil
        end
    end

    require(MAIN_MODULE)
end

local start_bridge = script_load

function script_load(settings)
    local is_started, start_error = pcall(start_bridge, settings)

    if not is_started then
        if trial ~= nil then
            switch_back(trial)
        end

        error(start_error, 0)
    end

    if is_new_launch then
        watch_trial(trial)
    end
end
