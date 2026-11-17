local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local OutputFingerprint = require('streamoscope-bridge.outputs.output_fingerprint')

local StreamOutputs = {}

StreamOutputs.__index = StreamOutputs

local function define_types()
    pcall(ffi.cdef, [[
        void obs_enum_outputs(bool (*enum_proc)(void *param, void *output), void *param);
        const char *obs_output_get_name(const void *output);
        void *obs_output_get_service(const void *output);
        const char *obs_service_get_connect_info(const void *service, uint32_t type);
        void *obs_service_get_settings(const void *service);
        const char *obs_data_get_string(void *data, const char *name);
        void obs_data_release(void *data);
        bool obs_output_active(const void *output);
        uint64_t obs_output_get_total_bytes(const void *output);
        int obs_output_get_frames_dropped(const void *output);
        int obs_output_get_total_frames(const void *output);
        float obs_output_get_congestion(void *output);
        bool obs_output_reconnecting(const void *output);
        void *obs_output_video(const void *output);
        uint64_t video_output_get_frame_time(const void *video);
        uint64_t os_gettime_ns(void);
        void *obs_service_get_ref(void *service);
        void obs_service_release(void *service);
    ]])
    pcall(ffi.cdef, 'void *obs_frontend_get_streaming_service(void);')
end

local function read_service_server(self, service)
    local server = self.libobs.obs_service_get_connect_info(service, consts.SERVER_URL_INFO)

    if server ~= nil and server[0] ~= 0 then
        return ffi.string(server)
    end

    local settings = self.libobs.obs_service_get_settings(service)

    if settings == nil then
        return nil
    end

    local setting = self.libobs.obs_data_get_string(settings, 'server')
    local result = setting ~= nil and ffi.string(setting) or nil

    self.libobs.obs_data_release(settings)

    return result
end

local function take_text(pointer)
    if pointer ~= nil and pointer[0] ~= 0 then
        return pointer
    end

    return nil
end

local function read_secret(self, service, settings, info_type, setting_name)
    local from_service = take_text(self.libobs.obs_service_get_connect_info(service, info_type))

    if from_service ~= nil or settings == nil then
        return from_service or ''
    end

    return take_text(self.libobs.obs_data_get_string(settings, setting_name)) or ''
end

local function fingerprint_service(self, service, server)
    if self.fingerprint == nil then
        return nil, nil
    end

    local settings = self.libobs.obs_service_get_settings(service)
    local key = read_secret(self, service, settings, consts.STREAM_KEY_INFO, 'key')
    local token = read_secret(self, service, settings, consts.BEARER_TOKEN_INFO, 'bearer_token')
    local fingerprint = self.fingerprint:compute({server or '', key, token})
    local key_fingerprint = self.fingerprint:compute_key(key, token)

    if settings ~= nil then
        self.libobs.obs_data_release(settings)
    end

    return fingerprint, key_fingerprint
end

local function read_duration_ms(self, output, total_frames)
    local video = self.libobs.obs_output_video(output)

    if video == nil then
        return 0
    end

    local frame_time_ns = tonumber(self.libobs.video_output_get_frame_time(video))

    return math.floor(total_frames * frame_time_ns / consts.NANOSECONDS_PER_MILLISECOND)
end

local function visit_output(self, output)
    local service = self.libobs.obs_output_get_service(output)

    if service == nil then
        return
    end

    local name = self.libobs.obs_output_get_name(output)

    if name ~= nil then
        local server = read_service_server(self, service)
        local total_frames = self.libobs.obs_output_get_total_frames(output)
        local fingerprint, key_fingerprint = fingerprint_service(self, service, server)

        self.found[#self.found + 1] = {
            name = ffi.string(name),
            server = server,
            id = fingerprint,
            key_id = key_fingerprint,
            is_active = self.libobs.obs_output_active(output),
            total_bytes = tonumber(self.libobs.obs_output_get_total_bytes(output)),
            dropped = self.libobs.obs_output_get_frames_dropped(output),
            total_frames = total_frames,
            duration_ms = read_duration_ms(self, output, total_frames),
            congestion = self.libobs.obs_output_get_congestion(output),
            is_reconnecting = self.libobs.obs_output_reconnecting(output),
        }
    end
end

function StreamOutputs.new()
    local self = setmetatable({found = {}}, StreamOutputs)

    define_types()

    local libobs_loaded, libobs = pcall(ffi.load, 'obs')

    if not libobs_loaded then
        return self
    end

    local fingerprint_created, fingerprint = pcall(OutputFingerprint.new)
    local frontend_loaded, frontend = pcall(ffi.load, 'obs-frontend-api')

    self.libobs = libobs
    self.frontend = frontend_loaded and frontend or nil
    self.fingerprint = fingerprint_created and fingerprint or nil
    self.visit = ffi.cast('bool (*)(void *, void *)', function(_param, output)
        visit_output(self, output)

        return true
    end)

    return self
end

function StreamOutputs:close()
    if self.visit ~= nil then
        self.visit:free()
    end

    if self.fingerprint ~= nil then
        self.fingerprint:close()
    end

    self.visit = nil
    self.fingerprint = nil
    self.frontend = nil
end

function StreamOutputs:read()
    if self.visit == nil then
        return nil
    end

    self.found = {}
    self.libobs.obs_enum_outputs(self.visit, nil)

    return self.found, math.floor(tonumber(self.libobs.os_gettime_ns()) / consts.NANOSECONDS_PER_MILLISECOND)
end

function StreamOutputs:read_main_key_id()
    if self.frontend == nil or self.fingerprint == nil then
        return nil
    end

    local borrowed_service = self.frontend.obs_frontend_get_streaming_service()

    if borrowed_service == nil then
        return nil
    end

    local service = self.libobs.obs_service_get_ref(borrowed_service)

    if service == nil then
        return nil
    end

    local computed, _fingerprint, key_fingerprint = pcall(fingerprint_service, self, service, nil)

    self.libobs.obs_service_release(service)

    return computed and key_fingerprint or nil
end

return StreamOutputs
