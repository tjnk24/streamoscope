local ffi = require('ffi')

local CP_UTF8 = 65001
local GENERIC_READ = 0x80000000
local GENERIC_WRITE = 0x40000000
local FILE_SHARE_READ_WRITE_DELETE = 0x00000007
local OPEN_EXISTING = 3
local CREATE_ALWAYS = 2
local MOVEFILE_REPLACE_EXISTING = 1
local INVALID_HANDLE_VALUE = ffi.cast('void *', -1)
local MAX_SOURCE_BYTES = 1024 * 1024
local STUB_VERSION = 1
local STUB_MODULE = 'streamoscope-bridge.stub'
local MODULE_PREFIX = 'streamoscope-bridge.'
local LOADER_FILE = 'streamoscope-bridge.lua'
local CURRENT_VERSION_FILE = 'current-version.js'
local CURRENT_VERSION_TEMPLATE = "window.STREAMOSCOPE_VERSION = '%s';\r\n"
local VERSION_PATTERN = '%d+%.%d+%.%d+'
local TRIAL_FILE = 'update-trial.txt'
local HEALTHY_FILE = 'healthy-version.txt'
local HEALTHY_LOADER_FILE = 'healthy-loader.txt'
local ROLLED_BACK_FILE = 'rolled-back-version.txt'
local OBS_CALLBACKS = {'script_load', 'script_unload', 'script_description', 'script_properties', 'script_defaults', 'script_update', 'script_save', 'script_tick'}

pcall(ffi.cdef, 'int MultiByteToWideChar(uint32_t codePage, uint32_t flags, const char *text, int length, uint16_t *buffer, int bufferLength);')
pcall(ffi.cdef, 'void *CreateFileW(const uint16_t *path, uint32_t access, uint32_t shareMode, void *security, uint32_t disposition, uint32_t flags, void *template);')
pcall(ffi.cdef, 'int ReadFile(void *file, void *buffer, uint32_t bytesToRead, uint32_t *bytesRead, void *overlapped);')
pcall(ffi.cdef, 'int WriteFile(void *file, const void *buffer, uint32_t bytesToWrite, uint32_t *bytesWritten, void *overlapped);')
pcall(ffi.cdef, 'int DeleteFileW(const uint16_t *path);')
pcall(ffi.cdef, 'int MoveFileExW(const uint16_t *source, const uint16_t *target, uint32_t flags);')
pcall(ffi.cdef, 'int CloseHandle(void *handle);')

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
        return false
    end

    local bytes_written = ffi.new('uint32_t[1]')
    local is_written = ffi.C.WriteFile(file, text, #text, bytes_written, nil) ~= 0 and bytes_written[0] == #text

    ffi.C.CloseHandle(file)

    return is_written
end

local install_root = script_path()
local obs_script_path = script_path
local original_searchers = {unpack(package.loaders)}

local function loader_path(version)
    return install_root .. 'versions/' .. version .. '/' .. LOADER_FILE
end

local function read_version(file_name, pattern)
    return string.match(read_file(install_root .. file_name) or '', pattern or VERSION_PATTERN)
end

local function has_loader(version)
    return version ~= nil and read_file(loader_path(version)) ~= nil
end

local function run_loader(version)
    local path = loader_path(version)
    local source = read_file(path)

    if source == nil then
        return false, 'StreamoScope: ' .. path .. ' is missing'
    end

    local chunk, compile_error = loadstring(source, '@' .. path)

    if chunk == nil then
        return false, compile_error
    end

    local is_loaded, load_error = pcall(chunk)

    if is_loaded then
        write_file(install_root .. HEALTHY_LOADER_FILE, version)
    end

    return is_loaded, load_error
end

local function find_fallback(broken_version, trial_previous)
    local candidates = {trial_previous or false, read_version(HEALTHY_FILE) or false, read_version(HEALTHY_LOADER_FILE) or false}

    for _index, candidate in ipairs(candidates) do
        if candidate and candidate ~= broken_version and has_loader(candidate) then
            return candidate
        end
    end

    return nil
end

local function switch_to(version, broken_version)
    local current_version_path = install_root .. CURRENT_VERSION_FILE
    local temporary_path = current_version_path .. '.tmp'
    local is_written = write_file(temporary_path, string.format(CURRENT_VERSION_TEMPLATE, version))

    if not is_written or ffi.C.MoveFileExW(to_wide(temporary_path), to_wide(current_version_path), MOVEFILE_REPLACE_EXISTING) == 0 then
        ffi.C.DeleteFileW(to_wide(temporary_path))

        return false
    end

    write_file(install_root .. ROLLED_BACK_FILE, broken_version)
    ffi.C.DeleteFileW(to_wide(install_root .. TRIAL_FILE))

    return true
end

local function reset_loader_state()
    script_path = obs_script_path

    for index = #package.loaders, 1, -1 do
        package.loaders[index] = nil
    end

    for index, searcher in ipairs(original_searchers) do
        package.loaders[index] = searcher
    end

    for module_name in pairs(package.loaded) do
        if string.sub(module_name, 1, #MODULE_PREFIX) == MODULE_PREFIX and module_name ~= STUB_MODULE then
            package.loaded[module_name] = nil
        end
    end

    for _index, callback_name in ipairs(OBS_CALLBACKS) do
        _G[callback_name] = nil
    end
end

package.loaded[STUB_MODULE] = {version = STUB_VERSION}

local current_version = read_version(CURRENT_VERSION_FILE)

if current_version == nil then
    error('StreamoScope: ' .. install_root .. CURRENT_VERSION_FILE .. ' is missing or damaged', 0)
end

local trial_version = read_version(TRIAL_FILE, 'version=(' .. VERSION_PATTERN .. ')')
local trial_previous = trial_version == current_version and read_version(TRIAL_FILE, 'previous=(' .. VERSION_PATTERN .. ')') or nil
local judge_version = trial_previous ~= current_version and has_loader(trial_previous) and trial_previous or current_version
local is_loaded, load_error = run_loader(judge_version)

if not is_loaded then
    local fallback_version = find_fallback(current_version, trial_previous)

    if fallback_version == nil or not switch_to(fallback_version, current_version) then
        error(load_error, 0)
    end

    reset_loader_state()

    local is_fallback_loaded, fallback_error = run_loader(fallback_version)

    if not is_fallback_loaded then
        error(fallback_error, 0)
    end
end
