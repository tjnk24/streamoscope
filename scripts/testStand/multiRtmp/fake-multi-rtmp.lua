local obs = obslua
local ffi = require('ffi')

pcall(ffi.cdef, 'char *obs_frontend_get_current_profile_path(void);')
pcall(ffi.cdef, 'void bfree(void *pointer);')

local OUTPUT_NAME = 'multi-output'
local SERVICE_NAME = 'multi-output-service'
local AUDIO_BITRATE = 64
local CONFIG_FILE = 'obs-multi-rtmp.json'
local DEFAULT_PROTOCOL = 'RTMP'

local OUTPUT_TYPES = {
    RTMP = 'rtmp_output',
    SRT_RIST = 'ffmpeg_mpegts_muxer',
}

local targets = {}

local function release_targets(is_sync_stop_only)
    local kept = {}

    for _index, target in ipairs(targets) do
        if is_sync_stop_only and not target.is_sync_stop then
            kept[#kept + 1] = target
        else
            obs.obs_output_stop(target.output)
            obs.obs_output_release(target.output)
            obs.obs_service_release(target.service)
            obs.obs_encoder_release(target.video_encoder)
            obs.obs_encoder_release(target.audio_encoder)
        end
    end

    targets = kept
end

local function create_service(server, key)
    local settings = obs.obs_data_create()

    obs.obs_data_set_string(settings, 'server', server)
    obs.obs_data_set_string(settings, 'key', key)

    local service = obs.obs_service_create('rtmp_custom', SERVICE_NAME, settings, nil)

    obs.obs_data_release(settings)

    return service
end

local function create_video_encoder(key, video_config)
    local encoder = obs.obs_video_encoder_create(video_config.encoder, 'stand-video-' .. key, video_config.param, nil)

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

local function start_target(output_type, server, key, video_config, is_sync_stop)
    local target = {
        output = obs.obs_output_create(output_type, OUTPUT_NAME, nil, nil),
        service = create_service(server, key),
        video_encoder = create_video_encoder(key, video_config),
        audio_encoder = create_audio_encoder(key),
        is_sync_stop = is_sync_stop,
    }

    obs.obs_output_set_service(target.output, target.service)
    obs.obs_output_set_video_encoder(target.output, target.video_encoder)
    obs.obs_output_set_audio_encoder(target.output, target.audio_encoder, 0)
    obs.obs_output_start(target.output)

    targets[#targets + 1] = target
end

local function read_video_configs(config)
    local found = {}
    local video_configs = obs.obs_data_get_array(config, 'video_configs')

    for config_index = 0, obs.obs_data_array_count(video_configs) - 1 do
        local video_config = obs.obs_data_array_item(video_configs, config_index)

        found[obs.obs_data_get_string(video_config, 'id')] = {
            encoder = obs.obs_data_get_string(video_config, 'encoder'),
            param = obs.obs_data_get_obj(video_config, 'param'),
        }

        obs.obs_data_release(video_config)
    end

    obs.obs_data_array_release(video_configs)

    return found
end

local function release_video_configs(video_configs)
    for _id, video_config in pairs(video_configs) do
        obs.obs_data_release(video_config.param)
    end
end

local function read_flag(target_settings, name, default_value)
    if obs.obs_data_has_user_value(target_settings, name) then
        return obs.obs_data_get_bool(target_settings, name)
    end

    return default_value
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

    local video_configs = read_video_configs(config)
    local target_list = obs.obs_data_get_array(config, 'targets')

    for target_index = 0, obs.obs_data_array_count(target_list) - 1 do
        local target_settings = obs.obs_data_array_item(target_list, target_index)
        local service_settings = obs.obs_data_get_obj(target_settings, 'service-param')
        local video_config = video_configs[obs.obs_data_get_string(target_settings, 'video-config')]
        local is_enabled = read_flag(target_settings, 'enabled', true)
        local is_sync_start = read_flag(target_settings, 'sync-start', false)
        local is_sync_stop = read_flag(target_settings, 'sync-stop', is_sync_start)
        local protocol = obs.obs_data_get_string(target_settings, 'protocol')
        local output_type = OUTPUT_TYPES[protocol ~= '' and protocol or DEFAULT_PROTOCOL]

        if is_enabled and is_sync_start and video_config ~= nil and output_type ~= nil then
            start_target(output_type, obs.obs_data_get_string(service_settings, 'server'), obs.obs_data_get_string(service_settings, 'key'), video_config, is_sync_stop)
        end

        obs.obs_data_release(service_settings)
        obs.obs_data_release(target_settings)
    end

    release_video_configs(video_configs)
    obs.obs_data_array_release(target_list)
    obs.obs_data_release(config)
end

local function handle_frontend_event(event)
    if event == obs.OBS_FRONTEND_EVENT_STREAMING_STARTING and #targets == 0 then
        start_targets()
    elseif event == obs.OBS_FRONTEND_EVENT_STREAMING_STOPPING then
        release_targets(true)
    end
end

function script_description()
    return 'StreamoScope test stand: imitates obs-multi-rtmp: together with the main stream starts an output named multi-output for each enabled target with sync-start in obs-multi-rtmp.json of the profile.'
end

function script_load(_settings)
    obs.obs_frontend_add_event_callback(handle_frontend_event)
end

function script_unload()
    release_targets(false)
end
