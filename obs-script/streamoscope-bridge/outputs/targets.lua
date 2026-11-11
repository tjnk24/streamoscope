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

local function read_outputs(stream_outputs)
    if stream_outputs ~= nil then
        local enumerated, found = pcall(stream_outputs.read, stream_outputs)

        if enumerated and found ~= nil then
            return found
        end
    end

    return named_outputs.read()
end

function targets.read(stream_outputs)
    local result = {}

    for _index, output in ipairs(read_outputs(stream_outputs)) do
        local server = server_origin(output.server)

        if server ~= nil then
            result[#result + 1] = {name = output.name, server = server}
        end
    end

    return result
end

return targets
