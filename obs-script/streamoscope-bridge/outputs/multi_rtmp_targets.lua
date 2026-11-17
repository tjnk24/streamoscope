local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local OutputFingerprint = require('streamoscope-bridge.outputs.output_fingerprint')
local text_file = require('streamoscope-bridge.utils.text_file')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local MultiRtmpTargets = {}

MultiRtmpTargets.__index = MultiRtmpTargets

local function define_types()
    local declarations = {
        'void *obs_data_create_from_json_file(const char *path);',
        'void obs_data_release(void *data);',
        'void *obs_data_get_array(void *data, const char *name);',
        'void *obs_data_get_obj(void *data, const char *name);',
        'const char *obs_data_get_string(void *data, const char *name);',
        'bool obs_data_get_bool(void *data, const char *name);',
        'bool obs_data_has_user_value(void *data, const char *name);',
        'size_t obs_data_array_count(void *array);',
        'void *obs_data_array_item(void *array, size_t index);',
        'void obs_data_array_release(void *array);',
        'char *obs_frontend_get_current_profile_path(void);',
        'void bfree(void *pointer);',
        'void *obs_get_module(const char *name);',
        'const char *obs_get_module_binary_path(void *module);',
        'uint32_t GetFileVersionInfoSizeW(const uint16_t *path, uint32_t *handle);',
        'int GetFileVersionInfoW(const uint16_t *path, uint32_t handle, uint32_t length, void *data);',
        'int VerQueryValueW(const void *block, const uint16_t *subBlock, void **buffer, uint32_t *length);',
    }

    for _index, declaration in ipairs(declarations) do
        pcall(ffi.cdef, declaration)
    end
end

local function take_text(pointer)
    if pointer ~= nil and pointer[0] ~= 0 then
        return pointer
    end

    return nil
end

local function read_config_path(self)
    if self.frontend == nil then
        return nil
    end

    local pointer = self.frontend.obs_frontend_get_current_profile_path()

    if pointer == nil then
        return nil
    end

    local profile_path = ffi.string(pointer)

    self.libobs.bfree(pointer)

    if profile_path == '' then
        return nil
    end

    return string.gsub(profile_path, consts.PATH_TRAILING_SEPARATOR_PATTERN, '') .. '/' .. consts.MULTI_RTMP_CONFIG_FILE
end

local function read_file_version(path)
    local version_dll = ffi.load('version')
    local wide_path = wide_string.from_text(path)
    local size = version_dll.GetFileVersionInfoSizeW(wide_path, nil)

    if size == 0 then
        return nil
    end

    local block = ffi.new('uint8_t[?]', size)
    local fixed_info = ffi.new('void *[1]')
    local fixed_info_length = ffi.new('uint32_t[1]')

    if version_dll.GetFileVersionInfoW(wide_path, 0, size, block) == 0 then
        return nil
    end

    if version_dll.VerQueryValueW(block, wide_string.from_text(consts.FILE_VERSION_ROOT_BLOCK), fixed_info, fixed_info_length) == 0 then
        return nil
    end

    local fields = ffi.cast('uint32_t *', fixed_info[0])
    local high = fields[consts.FILE_VERSION_HIGH_FIELD_INDEX]
    local low = fields[consts.FILE_VERSION_LOW_FIELD_INDEX]

    return string.format(
        consts.FILE_VERSION_TEMPLATE,
        bit.rshift(high, consts.FILE_VERSION_PART_BITS),
        bit.band(high, consts.FILE_VERSION_PART_MASK),
        bit.rshift(low, consts.FILE_VERSION_PART_BITS),
        bit.band(low, consts.FILE_VERSION_PART_MASK)
    )
end

local function read_plugin_version(self)
    local module = self.libobs.obs_get_module(consts.MULTI_RTMP_MODULE_NAME)

    if module == nil then
        return nil
    end

    local binary_path = take_text(self.libobs.obs_get_module_binary_path(module))

    return binary_path ~= nil and read_file_version(ffi.string(binary_path)) or nil
end

local function report_unreadable(self, is_unreadable)
    if is_unreadable and not self.is_unreadable and self.journal ~= nil then
        local version_read, version = pcall(read_plugin_version, self)
        local plugin_version = version_read and version or consts.MULTI_RTMP_UNKNOWN_VERSION

        self.journal:log('WARN', string.format(consts.MULTI_RTMP_UNREADABLE_TEMPLATE, plugin_version))
    end

    self.is_unreadable = is_unreadable
end

local function describe_target(self, item)
    if self.libobs.obs_data_has_user_value(item, 'enabled') and not self.libobs.obs_data_get_bool(item, 'enabled') then
        return nil
    end

    local service = self.libobs.obs_data_get_obj(item, 'service-param')

    if service == nil then
        return nil
    end

    local server = take_text(self.libobs.obs_data_get_string(service, 'server'))
    local described = nil

    if server ~= nil then
        local full_server = ffi.string(server)
        local title = take_text(self.libobs.obs_data_get_string(item, 'name'))

        local parts = {
            full_server,
            take_text(self.libobs.obs_data_get_string(service, 'key')) or '',
            take_text(self.libobs.obs_data_get_string(service, 'bearer_token')) or '',
        }

        described = {
            id = self.fingerprint:compute(parts),
            server = full_server,
            title = title ~= nil and ffi.string(title) or nil,
        }
    end

    self.libobs.obs_data_release(service)

    return described
end

local function read_targets(self, data)
    local targets = self.libobs.obs_data_get_array(data, 'targets')

    if targets == nil then
        return nil
    end

    local found = {}

    for item_index = 0, tonumber(self.libobs.obs_data_array_count(targets)) - 1 do
        local item = self.libobs.obs_data_array_item(targets, item_index)

        if item ~= nil then
            local described_safely, described = pcall(describe_target, self, item)

            self.libobs.obs_data_release(item)

            if described_safely and described ~= nil and described.id ~= nil then
                found[#found + 1] = described
            end
        end
    end

    self.libobs.obs_data_array_release(targets)

    return found
end

local function refresh(self)
    self.config_path = self.config_path or read_config_path(self)

    if self.config_path == nil or not text_file.exists(self.config_path) then
        self.found = {}
        report_unreadable(self, false)

        return
    end

    local data = self.libobs.obs_data_create_from_json_file(self.config_path)
    local found = nil

    if data ~= nil then
        local read_safely, targets = pcall(read_targets, self, data)

        self.libobs.obs_data_release(data)
        found = read_safely and targets or nil
    end

    self.found = found or {}
    report_unreadable(self, found == nil)
end

function MultiRtmpTargets.new(journal)
    local self = setmetatable({found = {}, is_unreadable = false, journal = journal}, MultiRtmpTargets)

    define_types()

    local libobs_loaded, libobs = pcall(ffi.load, 'obs')

    if not libobs_loaded then
        return self
    end

    local fingerprint_created, fingerprint = pcall(OutputFingerprint.new)

    if not fingerprint_created then
        return self
    end

    local frontend_loaded, frontend = pcall(ffi.load, 'obs-frontend-api')

    self.libobs = libobs
    self.frontend = frontend_loaded and frontend or nil
    self.fingerprint = fingerprint

    return self
end

function MultiRtmpTargets:handle_profile_change()
    self.config_path = nil
    self.refreshed_at = nil
    self.found = {}
end

function MultiRtmpTargets:read()
    if self.libobs == nil then
        return {}
    end

    local now = os.time()

    if self.refreshed_at == nil or now - self.refreshed_at >= consts.MULTI_RTMP_REFRESH_SEC then
        self.refreshed_at = now
        refresh(self)
    end

    return self.found
end

function MultiRtmpTargets:close()
    if self.fingerprint ~= nil then
        self.fingerprint:close()
    end

    self.fingerprint = nil
    self.libobs = nil
    self.frontend = nil
    self.found = {}
end

return MultiRtmpTargets
