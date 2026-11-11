local consts = require('streamoscope-bridge.consts')
local environment = require('streamoscope-bridge.utils.environment')
local process = require('streamoscope-bridge.utils.process')
local profile_parameter = require('streamoscope-bridge.utils.profile_parameter')
local text_file = require('streamoscope-bridge.utils.text_file')

local Updater = {}

Updater.__index = Updater

local function start_updater(self, arguments)
    local command_line = string.format(consts.UPDATE_COMMAND_LINE, self.script_path, arguments)

    local is_started = process.start_hidden(command_line, environment.get('TEMP'))

    if self.journal ~= nil then
        self.journal:log(is_started and 'INFO' or 'ERROR', string.format('start %s started=%s', arguments, tostring(is_started)), 'updater')
    end

    return is_started
end

local function save_auto_update(self, value)
    text_file.ensure_directory(self.data_directory)
    text_file.write(self.auto_update_path, value)
end

local function confirm_version(self, version)
    text_file.write(self.healthy_version_path, version)
    text_file.write(self.healthy_process_path, tostring(process.current_id()))

    if string.match(text_file.read(self.trial_path) or '', consts.TRIAL_VERSION_PATTERN) == version then
        text_file.remove(self.trial_path)
    end

    local is_rolled_back = self:read_rolled_back_version() == version

    if is_rolled_back and text_file.replace(self.current_version_path, string.format(consts.CURRENT_VERSION_TEMPLATE, version)) then
        text_file.remove(self.rolled_back_version_path)
    end
end

function Updater.new(journal)
    local local_app_data = environment.get('LOCALAPPDATA')
    local data_directory = local_app_data ~= nil and (local_app_data .. '\\' .. consts.UPDATE_DATA_DIRECTORY) or nil

    return setmetatable({
        script_path = string.gsub(script_path() .. '/' .. consts.UPDATE_SCRIPT_PATH, '/', '\\'),
        signature_tool_path = string.gsub(script_path() .. '/' .. consts.UPDATE_SIGNATURE_TOOL_PATH, '/', '\\'),
        trial_path = string.gsub(script_path() .. '/' .. consts.TRIAL_FILE_PATH, '/', '\\'),
        healthy_version_path = string.gsub(script_path() .. '/' .. consts.HEALTHY_VERSION_FILE_PATH, '/', '\\'),
        healthy_process_path = string.gsub(script_path() .. '/' .. consts.HEALTHY_PROCESS_FILE_PATH, '/', '\\'),
        rolled_back_version_path = string.gsub(script_path() .. '/' .. consts.ROLLED_BACK_VERSION_FILE_PATH, '/', '\\'),
        current_version_path = string.gsub(script_path() .. '/' .. consts.CURRENT_VERSION_FILE_PATH, '/', '\\'),
        data_directory = data_directory,
        status_path = data_directory ~= nil and (data_directory .. '\\' .. consts.UPDATE_STATUS_FILE) or nil,
        auto_update_path = data_directory ~= nil and (data_directory .. '\\' .. consts.AUTO_UPDATE_FILE) or nil,
        next_check_at = os.time() + consts.AUTO_UPDATE_START_DELAY_SEC,
        journal = journal,
    }, Updater)
end

function Updater:is_available()
    return self.status_path ~= nil and text_file.exists(self.script_path) and text_file.exists(self.signature_tool_path)
end

function Updater:discard_stale_command()
    profile_parameter.take(consts.UPDATE_COMMAND_NAME)
end

function Updater:handle_command()
    local command = profile_parameter.take(consts.UPDATE_COMMAND_NAME)

    if command == nil or not self:is_available() then
        return
    end

    local version = string.match(command, consts.INSTALL_COMMAND_PATTERN)

    if version ~= nil then
        start_updater(self, '-Version ' .. version)

        return
    end

    local auto_update = string.match(command, consts.AUTO_UPDATE_COMMAND_PATTERN)

    if auto_update ~= nil then
        save_auto_update(self, auto_update)

        return
    end

    local healthy_version = string.match(command, consts.HEALTHY_COMMAND_PATTERN)

    if healthy_version ~= nil then
        confirm_version(self, healthy_version)
    end
end

function Updater:handle_schedule()
    local now = os.time()

    if now < self.next_check_at then
        return
    end

    self.next_check_at = now + consts.AUTO_UPDATE_INTERVAL_SEC

    if self:is_available() and text_file.read(self.auto_update_path) ~= consts.AUTO_UPDATE_OFF then
        start_updater(self, '-Auto')
    end
end

function Updater:read_status()
    if self.status_path == nil then
        return nil
    end

    return text_file.read(self.status_path)
end

function Updater:read_rolled_back_version()
    return string.match(text_file.read(self.rolled_back_version_path) or '', consts.ROLLED_BACK_VERSION_PATTERN)
end

function Updater:read_stub_version()
    local stub = package.loaded[consts.STUB_MODULE]

    return type(stub) == 'table' and stub.version or nil
end

function Updater:close()
end

return Updater
