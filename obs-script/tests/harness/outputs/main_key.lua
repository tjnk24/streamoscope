local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local ffi = require('ffi')
local consts = require('streamoscope-bridge.consts')

local empty_text = ffi.new('char[1]')
local references = {taken = 0, released = 0}
local settings_objects = {created = 0, released = 0}
local current_service = nil

local function to_text(value)
    if value == nil then
        return empty_text
    end

    return ffi.new('char[?]', #value + 1, value)
end

local fake_libobs = {
    obs_service_get_ref = function(service)
        if not service.is_alive then
            return nil
        end

        references.taken = references.taken + 1

        return service
    end,
    obs_service_release = function()
        references.released = references.released + 1
    end,
    obs_service_get_connect_info = function(service, info_type)
        return to_text(service.connect_info[info_type])
    end,
    obs_service_get_settings = function(service)
        settings_objects.created = settings_objects.created + 1

        return service.settings
    end,
    obs_data_get_string = function(data, name)
        return to_text(data[name])
    end,
    obs_data_release = function()
        settings_objects.released = settings_objects.released + 1
    end,
}

local fake_frontend = {
    obs_frontend_get_streaming_service = function()
        return current_service
    end,
}

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

package.loaded['streamoscope-bridge.outputs.stream_outputs'] = nil

local StreamOutputs = require('streamoscope-bridge.outputs.stream_outputs')
local stream_outputs = StreamOutputs.new()

ffi.load = real_ffi_load

current_service = {
    is_alive = true,
    connect_info = {[consts.STREAM_KEY_INFO] = 'main_secret-key'},
    settings = {},
}

record('fromConnectInfo', stream_outputs:read_main_key_id())

current_service = {
    is_alive = true,
    connect_info = {},
    settings = {bearer_token = 'secret-token'},
}

record('fromSettings', stream_outputs:read_main_key_id())

current_service = {
    is_alive = true,
    connect_info = {},
    settings = {},
}

record('withoutKey', stream_outputs:read_main_key_id())

current_service = nil

record('withoutService', stream_outputs:read_main_key_id())

current_service = {
    is_alive = false,
    connect_info = {},
    settings = {key = 'gone_secret-key'},
}

record('destroyedService', stream_outputs:read_main_key_id())
record('referencesTaken', references.taken)
record('referencesLeft', references.taken - references.released)
record('settingsLeft', settings_objects.created - settings_objects.released)

current_service = {
    is_alive = true,
    connect_info = {[consts.STREAM_KEY_INFO] = 'main_secret-key'},
    settings = {},
}

stream_outputs:close()
record('afterClose', stream_outputs:read_main_key_id())

script_unload()

return table.concat(results, '\n')
