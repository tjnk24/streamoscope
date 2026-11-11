local consts = require('streamoscope-bridge.consts')
local environment = require('streamoscope-bridge.utils.environment')
local process = require('streamoscope-bridge.utils.process')
local profile_parameter = require('streamoscope-bridge.utils.profile_parameter')

local release_links = {}

local function is_allowed(url)
    if #url > consts.OPEN_URL_MAX_LENGTH or string.match(url, consts.OPEN_URL_PATTERN) == nil then
        return false
    end

    for _index, allowed_pattern in ipairs(consts.OPEN_URL_ALLOWED_PATTERNS) do
        if string.find(url, allowed_pattern) ~= nil then
            return true
        end
    end

    return false
end

function release_links.discard_stale_command()
    profile_parameter.take(consts.OPEN_URL_COMMAND_NAME)
end

function release_links.handle_command()
    local url = profile_parameter.take(consts.OPEN_URL_COMMAND_NAME)
    local system_root = environment.get('SystemRoot')

    if url == nil or system_root == nil or not is_allowed(url) then
        return false
    end

    return process.start_hidden(string.format(consts.OPEN_URL_COMMAND_LINE, system_root, url), nil)
end

return release_links
