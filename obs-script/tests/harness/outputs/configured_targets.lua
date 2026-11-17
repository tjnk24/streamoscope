local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local ffi = require('ffi')
local environment = require('streamoscope-bridge.utils.environment')
local Journal = require('streamoscope-bridge.journal.journal')
local MultiRtmpTargets = require('streamoscope-bridge.outputs.multi_rtmp_targets')
local publisher = require('streamoscope-bridge.publisher')
local text_file = require('streamoscope-bridge.utils.text_file')

local array_metatable = {}
local empty_text = ffi.new('char[1]')
local documents = {}
local module_path = nil

local function to_fake_data(value)
    if type(value) == 'string' then
        return ffi.new('char[?]', #value + 1, value)
    end

    if type(value) ~= 'table' then
        return value
    end

    local converted = {}

    for field, field_value in pairs(value) do
        converted[field] = to_fake_data(field_value)
    end

    return setmetatable(converted, getmetatable(value))
end

local function fake_array(items)
    return setmetatable(items, array_metatable)
end

local fake_libobs = {
    obs_data_create_from_json_file = function(path) return documents[path] end,
    obs_data_release = function() end,
    obs_data_get_array = function(data, name)
        local value = data[name]

        return getmetatable(value) == array_metatable and value or nil
    end,
    obs_data_get_obj = function(data, name)
        local value = data[name]

        return type(value) == 'table' and getmetatable(value) ~= array_metatable and value or nil
    end,
    obs_data_get_string = function(data, name)
        local value = data[name]

        return type(value) == 'cdata' and value or empty_text
    end,
    obs_data_get_bool = function(data, name) return data[name] == true end,
    obs_data_has_user_value = function(data, name) return data[name] ~= nil end,
    obs_data_array_count = function(array) return #array end,
    obs_data_array_item = function(array, item_index) return array[item_index + 1] end,
    obs_data_array_release = function() end,
    obs_get_module = function(name)
        if name == 'obs-multi-rtmp' and module_path ~= nil then
            return {}
        end

        return nil
    end,
    obs_get_module_binary_path = function() return module_path end,
    bfree = function() end,
}

local profile_directory = root .. 'profile'
local config_path = profile_directory .. '/obs-multi-rtmp.json'
local current_profile_path = nil

local fake_frontend = {
    obs_frontend_get_current_profile_path = function()
        return current_profile_path ~= nil and to_fake_data(current_profile_path) or nil
    end,
}

text_file.ensure_directory(profile_directory)
text_file.write(config_path, '{"targets": []}')

documents[config_path] = to_fake_data({
    targets = fake_array({
        {
            id = '1',
            name = 'Main channel',
            enabled = true,
            protocol = 'RTMP',
            ['service-param'] = {
                server = 'rtmp://streamer:secret-password@live.example.com/app',
                key = 'live_secret-key',
                use_auth = false,
            },
        },
        {
            id = '2',
            name = 'Switched off',
            enabled = false,
            protocol = 'RTMP',
            ['service-param'] = {
                server = 'rtmp://off.example.com/app',
                key = 'off_secret-key',
            },
        },
        {
            id = '3',
            name = 'Talk show',
            protocol = 'WHIP',
            ['service-param'] = {
                server = 'https://whip.example.com/whip/endpoint',
                bearer_token = 'secret-token',
            },
        },
        {
            id = '5',
            name = 'Backup server',
            protocol = 'RTMP',
            ['service-param'] = {
                server = 'rtmp://backup.example.com/app',
                key = 'live_secret-key',
            },
        },
        {
            id = '4',
            name = 'No server',
            enabled = true,
            ['service-param'] = {
                server = '',
                key = 'lost_secret-key',
            },
        },
    }),
})

local journal = Journal.new()
local real_ffi_load = ffi.load

ffi.load = function(name, ...)
    if name == 'obs' then
        return fake_libobs
    end

    if name == 'obs-frontend-api' then
        return fake_frontend
    end

    return real_ffi_load(name, ...)
end

local multi_rtmp_targets = MultiRtmpTargets.new(journal)

ffi.load = real_ffi_load

local sources = {journal = journal, multi_rtmp_targets = multi_rtmp_targets}

local function publish_configured()
    publisher.publish(sources)

    local payload = store['StreamoScope/PluginOutputs'] or ''

    return string.match(payload, '"configuredTargets":(%b[])'), payload
end

record('beforeProfile', (publish_configured()))

current_profile_path = profile_directory .. '/'
multi_rtmp_targets:handle_profile_change()

local configured, payload = publish_configured()

record('configured', configured)
record('secretsHidden', string.find(payload, 'secret', 1, true) == nil)

documents[config_path] = to_fake_data({targets = fake_array({})})
record('cachedUntilRefresh', (publish_configured()) == configured)

fake_now = fake_now + 5
record('afterRefresh', (publish_configured()))

module_path = to_fake_data(environment.get('SystemRoot') .. '\\System32\\kernel32.dll')
documents[config_path] = to_fake_data({version = 2})
fake_now = fake_now + 5
record('notUnderstood', (publish_configured()))
fake_now = fake_now + 5
publish_configured()

text_file.remove(config_path)
fake_now = fake_now + 5
record('withoutFile', (publish_configured()))

multi_rtmp_targets:close()
record('afterClose', #multi_rtmp_targets:read())

script_unload()

return table.concat(results, '\n')
