local obs = obslua

local consts = require('streamoscope-bridge.consts')
local JournalStats = require('streamoscope-bridge.journal.journal_stats')
local environment = require('streamoscope-bridge.utils.environment')
local process = require('streamoscope-bridge.utils.process')
local profile_parameter = require('streamoscope-bridge.utils.profile_parameter')
local text_file = require('streamoscope-bridge.utils.text_file')

local Journal = {}

Journal.__index = Journal

local function get_utc_offset()
    local now = os.time()
    local local_date = os.date('*t', now)
    local utc_date = os.date('!*t', now)

    utc_date.isdst = local_date.isdst

    local offset_minutes = math.floor(os.difftime(os.time(local_date), os.time(utc_date)) / 60)
    local sign = offset_minutes < 0 and '-' or '+'
    local absolute_minutes = math.abs(offset_minutes)

    return string.format('%s%02d:%02d', sign, math.floor(absolute_minutes / 60), absolute_minutes % 60)
end

local function read_obs_version()
    local is_read, version = pcall(obs.obs_get_version_string)

    return is_read and version or 'unknown'
end

local function ensure_directories(self)
    text_file.ensure_directory(self.data_directory)
    text_file.ensure_directory(self.directory)
end

local function append(self, text)
    if self.path == nil or not self.is_enabled then
        return
    end

    if self.size == 0 then
        ensure_directories(self)
    elseif self.size + #text > consts.JOURNAL_MAX_FILE_BYTES then
        text_file.move(self.path, self.old_path)
        self.size = 0
    end

    if text_file.append(self.path, text) then
        self.size = self.size + #text
    end
end

local function save_setting(self, value)
    ensure_directories(self)
    text_file.write(self.setting_path, value)

    self.is_enabled = value ~= consts.JOURNAL_OFF
end

local function open_folder(self)
    local system_root = environment.get('SystemRoot')

    if system_root == nil then
        return
    end

    ensure_directories(self)
    process.start_hidden(string.format(consts.JOURNAL_OPEN_COMMAND_LINE, system_root, self.directory), nil)
end

local function handle_lines(self)
    local lines = profile_parameter.take(consts.JOURNAL_LINES_NAME)

    if lines == nil then
        return
    end

    local cleaned_lines = {}

    for line in string.gmatch(lines, consts.JOURNAL_LINE_PATTERN) do
        local cleaned_line = string.gsub(string.sub(line, 1, consts.JOURNAL_MAX_LINE_BYTES), consts.JOURNAL_CONTROL_CHARACTER_PATTERN, ' ')

        cleaned_lines[#cleaned_lines + 1] = cleaned_line .. '\r\n'
    end

    append(self, table.concat(cleaned_lines))
end

local function handle_setting(self)
    local command = profile_parameter.take(consts.JOURNAL_COMMAND_NAME)

    if command == consts.JOURNAL_OPEN then
        open_folder(self)
    elseif command == consts.JOURNAL_ON and not self.is_enabled then
        save_setting(self, command)
        self:log('INFO', 'journal turned on')
    elseif command == consts.JOURNAL_OFF and self.is_enabled then
        self:log('INFO', 'journal turned off')
        save_setting(self, command)
    end
end

function Journal.new()
    local local_app_data = environment.get('LOCALAPPDATA')

    local self = setmetatable({
        is_enabled = false,
        size = 0,
        next_heartbeat_at = os.time() + consts.JOURNAL_HEARTBEAT_SEC,
        next_stats_at = os.time() + consts.JOURNAL_STATS_INTERVAL_SEC,
        stats = JournalStats.new(),
    }, Journal)

    if local_app_data == nil then
        return self
    end

    self.data_directory = local_app_data .. '\\' .. consts.UPDATE_DATA_DIRECTORY
    self.directory = self.data_directory .. '\\' .. consts.JOURNAL_DIRECTORY
    self.path = self.directory .. '\\' .. consts.JOURNAL_FILE
    self.old_path = self.directory .. '\\' .. consts.JOURNAL_OLD_FILE
    self.setting_path = self.data_directory .. '\\' .. consts.JOURNAL_SETTING_FILE
    self.size = text_file.size(self.path)
    self.is_enabled = text_file.read(self.setting_path) ~= consts.JOURNAL_OFF

    profile_parameter.take(consts.JOURNAL_LINES_NAME)
    profile_parameter.take(consts.JOURNAL_COMMAND_NAME)

    local version = string.match(script_path(), consts.JOURNAL_VERSION_PATTERN) or 'manual'

    self:log('INFO', string.format('loaded version=%s bridge=%d obs=%s locale=%s utc=%s', version, consts.BRIDGE_VERSION, read_obs_version(), obs.obs_get_locale(), get_utc_offset()))

    return self
end

function Journal:log(level, message, source)
    pcall(append, self, string.format(consts.JOURNAL_LINE_TEMPLATE, os.date(consts.JOURNAL_TIME_FORMAT), level, source or 'bridge', message))
end

function Journal:handle_command()
    if self.path == nil then
        return
    end

    handle_lines(self)
    handle_setting(self)
end

function Journal:handle_schedule(sources)
    local now = os.time()

    if now >= self.next_heartbeat_at then
        self.next_heartbeat_at = now + consts.JOURNAL_HEARTBEAT_SEC
        self:log('INFO', 'alive')
    end

    if now >= self.next_stats_at then
        self.next_stats_at = now + consts.JOURNAL_STATS_INTERVAL_SEC

        for _index, line in ipairs(self.stats:read(sources, self.gpu, now)) do
            self:log('STAT', line.message, line.source)
        end
    end
end

function Journal:handle_frontend_event(event)
    for event_name, message in pairs(consts.JOURNAL_FRONTEND_EVENTS) do
        if obs[event_name] == event then
            self:log('INFO', message, 'obs')

            return
        end
    end
end

function Journal:track_payload(payload)
    self.gpu = payload.gpu

    local update = payload.update

    if update == nil then
        return
    end

    local status = type(update.status) == 'string' and update.status or ''
    local stage = string.match(status, consts.JOURNAL_UPDATE_STAGE_PATTERN)

    if stage ~= nil and stage ~= self.update_stage then
        local version = string.match(status, consts.JOURNAL_UPDATE_VERSION_PATTERN) or 'unknown'
        local update_error = string.match(status, consts.JOURNAL_UPDATE_ERROR_PATTERN)

        self.update_stage = stage
        self:log(update_error ~= nil and 'ERROR' or 'INFO', string.format('stage=%s version=%s error=%s', stage, version, update_error or 'none'), 'updater')
    end

    if update.rolledBackVersion ~= self.rolled_back_version then
        self.rolled_back_version = update.rolledBackVersion

        if update.rolledBackVersion ~= nil then
            self:log('WARN', 'rolled back version=' .. update.rolledBackVersion, 'updater')
        end
    end
end

function Journal:close()
    self.stats:close()
    self:log('INFO', 'unloaded')
end

return Journal
