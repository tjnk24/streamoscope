local obs = obslua
local ffi = require('ffi')

pcall(ffi.cdef, 'char *obs_frontend_get_current_profile_path(void);')
pcall(ffi.cdef, 'void bfree(void *pointer);')

local COMMAND_SECTION = 'StreamoScopeStand'
local COMMAND_NAME = 'FakeMultiRtmp'
local COMMAND_OFF = 'off'
local COMMAND_INTERVAL_MS = 250
local OUTPUT_NAME = 'multi-output'
local SERVICE_NAME = 'multi-output-service'
local AUDIO_BITRATE = 64
local DEFAULT_BITRATE = 400
local CONFIG_FILE = 'obs-multi-rtmp.json'

local targets = {}

local function release_targets()
    for _index, target in ipairs(targets) do
        obs.obs_output_stop(target.output)
        obs.obs_output_release(target.output)
        obs.obs_service_release(target.service)
        obs.obs_encoder_release(target.video_encoder)
        obs.obs_encoder_release(target.audio_encoder)
    end

    targets = {}
end

local function create_service(server, key)
    local settings = obs.obs_data_create()

    obs.obs_data_set_string(settings, 'server', server)
    obs.obs_data_set_string(settings, 'key', key)

    local service = obs.obs_service_create('rtmp_custom', SERVICE_NAME, settings, nil)

    obs.obs_data_release(settings)

    return service
end

local function create_video_encoder(key, bitrate)
    local settings = obs.obs_data_create()

    obs.obs_data_set_string(settings, 'rate_control', 'CBR')
    obs.obs_data_set_int(settings, 'bitrate', bitrate)
    obs.obs_data_set_string(settings, 'preset', 'ultrafast')
    obs.obs_data_set_int(settings, 'keyint_sec', 2)

    local encoder = obs.obs_video_encoder_create('obs_x264', 'stand-video-' .. key, settings, nil)

    obs.obs_data_release(settings)
    obs.obs_encoder_set_video(encoder, obs.obs_get_video())

    return encoder
end

local function create_audio_encoder(key)
    local settings = obs.obs_data_create()

    obs.obs_data_set_int(settings, 'bitrate', AUDIO_BITRATE)

    local encoder = obs.obs_audio_encoder_create('ffmpeg_aac', 'stand-audio-' .. key, settings, 0, nil)

    obs.obs_data_release(settings)
    obs.obs_encoder_set_audio(encoder, obs.obs_get_audio())

    return encoder
end

local function start_target(server, key, bitrate)
    local target = {
        output = obs.obs_output_create('rtmp_output', OUTPUT_NAME, nil, nil),
        service = create_service(server, key),
        video_encoder = create_video_encoder(key, bitrate),
        audio_encoder = create_audio_encoder(key),
    }

    obs.obs_output_set_service(target.output, target.service)
    obs.obs_output_set_video_encoder(target.output, target.video_encoder)
    obs.obs_output_set_audio_encoder(target.output, target.audio_encoder, 0)
    obs.obs_output_start(target.output)

    targets[#targets + 1] = target
end

local function read_bitrates(config)
    local bitrates = {}
    local video_configs = obs.obs_data_get_array(config, 'video_configs')

    for config_index = 0, obs.obs_data_array_count(video_configs) - 1 do
        local video_config = obs.obs_data_array_item(video_configs, config_index)
        local param = obs.obs_data_get_obj(video_config, 'param')

        bitrates[obs.obs_data_get_string(video_config, 'id')] = obs.obs_data_get_int(param, 'bitrate')
        obs.obs_data_release(param)
        obs.obs_data_release(video_config)
    end

    obs.obs_data_array_release(video_configs)

    return bitrates
end

local function start_targets()
    local profile_pointer = ffi.load('obs-frontend-api').obs_frontend_get_current_profile_path()
    local profile_path = ffi.string(profile_pointer)

    ffi.load('obs').bfree(profile_pointer)

    local config_path = string.gsub(profile_path, '[\\/]+$', '') .. '/' .. CONFIG_FILE
    local config = obs.obs_data_create_from_json_file(config_path)

    if config == nil then
        return
    end

    local bitrates = read_bitrates(config)
    local target_list = obs.obs_data_get_array(config, 'targets')

    for target_index = 0, obs.obs_data_array_count(target_list) - 1 do
        local target_settings = obs.obs_data_array_item(target_list, target_index)
        local service_settings = obs.obs_data_get_obj(target_settings, 'service-param')
        local bitrate = bitrates[obs.obs_data_get_string(target_settings, 'video-config')] or DEFAULT_BITRATE

        if obs.obs_data_get_bool(target_settings, 'enabled') then
            start_target(obs.obs_data_get_string(service_settings, 'server'), obs.obs_data_get_string(service_settings, 'key'), bitrate)
        end

        obs.obs_data_release(service_settings)
        obs.obs_data_release(target_settings)
    end

    obs.obs_data_array_release(target_list)
    obs.obs_data_release(config)
end

local function handle_command()
    local config = obs.obs_frontend_get_profile_config()
    local command = obs.config_get_string(config, COMMAND_SECTION, COMMAND_NAME)

    if command == nil or command == '' then
        return
    end

    obs.config_remove_value(config, COMMAND_SECTION, COMMAND_NAME)
    release_targets()

    if command ~= COMMAND_OFF then
        start_targets()
    end
end

function script_description()
    return 'StreamoScope test stand: imitates obs-multi-rtmp: starts an output named multi-output for each enabled target of obs-multi-rtmp.json in the profile.'
end

function script_load(_settings)
    obs.config_remove_value(obs.obs_frontend_get_profile_config(), COMMAND_SECTION, COMMAND_NAME)
    obs.timer_add(handle_command, COMMAND_INTERVAL_MS)
end

function script_unload()
    obs.timer_remove(handle_command)
    release_targets()
end
