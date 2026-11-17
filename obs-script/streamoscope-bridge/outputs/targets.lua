local consts = require('streamoscope-bridge.consts')
local named_outputs = require('streamoscope-bridge.outputs.named_outputs')

local targets = {}

local function server_origin(url)
    if url == nil then
        return nil
    end

    local scheme, authority = string.match(url, consts.SERVER_ORIGIN_PATTERN)

    if scheme == nil then
        return nil
    end

    return scheme .. string.gsub(authority, consts.SERVER_USERINFO_PATTERN, '')
end

local function describe_stats(output)
    if output.total_bytes == nil then
        return nil
    end

    return {
        isActive = output.is_active,
        totalBytes = output.total_bytes,
        totalFrames = output.total_frames,
        droppedFrames = output.dropped,
        durationMs = output.duration_ms,
        congestion = output.congestion,
        isReconnecting = output.is_reconnecting,
    }
end

local function read_outputs(stream_outputs)
    if stream_outputs ~= nil then
        local enumerated, found, sampled_at_ms = pcall(stream_outputs.read, stream_outputs)

        if enumerated and found ~= nil then
            return found, sampled_at_ms
        end
    end

    return named_outputs.read(), nil
end

function targets.read(stream_outputs)
    local result = {}
    local outputs, sampled_at_ms = read_outputs(stream_outputs)

    for _index, output in ipairs(outputs) do
        local server = server_origin(output.server)

        if server ~= nil then
            result[#result + 1] = {
                name = output.name,
                server = server,
                id = output.id,
                stats = describe_stats(output),
            }
        end
    end

    return result, sampled_at_ms
end

function targets.read_configured(multi_rtmp_targets)
    local result = {}

    if multi_rtmp_targets == nil then
        return result
    end

    for _index, target in ipairs(multi_rtmp_targets:read()) do
        local server = server_origin(target.server)

        if server ~= nil then
            result[#result + 1] = {
                id = target.id,
                name = consts.MULTI_RTMP_OUTPUT_NAME,
                server = server,
                title = target.title,
            }
        end
    end

    return result
end

return targets
