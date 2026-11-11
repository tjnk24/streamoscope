local ffi = require('ffi')

local obs = obslua

local consts = require('streamoscope-bridge.consts')

local JournalStats = {}

JournalStats.__index = JournalStats

local function define_types()
    pcall(ffi.cdef, [[
        double obs_get_active_fps(void);
        uint64_t obs_get_average_frame_time_ns(void);
        uint32_t obs_get_lagged_frames(void);
        void *obs_get_video(void);
        uint32_t video_output_get_skipped_frames(const void *video);
        void *os_cpu_usage_info_start(void);
        double os_cpu_usage_info_query(void *info);
        void os_cpu_usage_info_destroy(void *info);
        uint64_t os_get_proc_resident_size(void);
    ]])
end

local function read_outputs(sources)
    if sources.stream_outputs == nil then
        return {}
    end

    return sources.stream_outputs:read() or {}
end

local function is_recording()
    local is_read, recording = pcall(obs.obs_frontend_recording_active)

    return is_read and recording == true
end

local function describe_bitrate(self, label, output, elapsed_seconds)
    if elapsed_seconds == nil or elapsed_seconds <= 0 then
        return 'none'
    end

    local sent_bytes = math.max(output.total_bytes - (self.previous_bytes[label] or 0), 0)

    return string.format(consts.JOURNAL_BITRATE_TEMPLATE, sent_bytes * consts.BITS_PER_BYTE / consts.BITS_PER_KILOBIT / elapsed_seconds)
end

local function describe_outputs(self, outputs, elapsed_seconds)
    local lines = {}
    local name_counts = {}
    local bytes_by_label = {}

    for _index, output in ipairs(outputs) do
        if output.is_active then
            local name = string.gsub(output.name, consts.JOURNAL_LABEL_UNSAFE_PATTERN, '_')

            name_counts[name] = (name_counts[name] or 0) + 1

            local label = name_counts[name] > 1 and (name .. '#' .. name_counts[name]) or name

            lines[#lines + 1] = {
                source = label,
                message = string.format(
                    consts.JOURNAL_OUTPUT_STATS_TEMPLATE,
                    describe_bitrate(self, label, output, elapsed_seconds),
                    output.dropped,
                    output.total_frames,
                    output.congestion * 100,
                    tostring(output.is_reconnecting)
                ),
            }

            bytes_by_label[label] = output.total_bytes
        end
    end

    self.previous_bytes = bytes_by_label

    return lines
end

local function describe_gpu(gpu)
    if gpu == nil then
        return ''
    end

    return string.format(consts.JOURNAL_GPU_STATS_TEMPLATE, gpu.usage, gpu.encoder)
end

local function describe_obs(self, gpu)
    return string.format(
        consts.JOURNAL_OBS_STATS_TEMPLATE,
        self.libobs.obs_get_active_fps(),
        tonumber(self.libobs.obs_get_average_frame_time_ns()) / consts.NANOSECONDS_PER_MILLISECOND,
        self.libobs.obs_get_lagged_frames(),
        self.libobs.video_output_get_skipped_frames(self.libobs.obs_get_video()),
        self.libobs.os_cpu_usage_info_query(self.cpu_info),
        tonumber(self.libobs.os_get_proc_resident_size()) / consts.BYTES_PER_MEGABYTE,
        describe_gpu(gpu)
    )
end

function JournalStats.new()
    local self = setmetatable({previous_bytes = {}}, JournalStats)

    define_types()

    local is_loaded, libobs = pcall(ffi.load, 'obs')

    if is_loaded then
        self.libobs = libobs
        self.cpu_info = libobs.os_cpu_usage_info_start()
    end

    return self
end

function JournalStats:read(sources, gpu, now)
    local elapsed_seconds = self.last_read_at ~= nil and (now - self.last_read_at) or nil
    local lines = describe_outputs(self, read_outputs(sources), elapsed_seconds)

    self.last_read_at = now

    if self.libobs ~= nil and (#lines > 0 or is_recording()) then
        lines[#lines + 1] = {source = 'OBS', message = describe_obs(self, gpu)}
    end

    return lines
end

function JournalStats:close()
    if self.cpu_info ~= nil then
        self.libobs.os_cpu_usage_info_destroy(self.cpu_info)
    end

    self.cpu_info = nil
    self.libobs = nil
end

return JournalStats
