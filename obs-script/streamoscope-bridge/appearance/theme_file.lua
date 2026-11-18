local consts = require('streamoscope-bridge.consts')

local theme_file = {}

local function strip_comments(text)
    return (string.gsub(text, consts.OBS_THEME_COMMENT_PATTERN, ''))
end

local function trim(text)
    return (string.match(text, consts.OBS_THEME_TRIM_PATTERN))
end

local function read_variable_name(raw_name)
    local windows_name = string.match(raw_name, consts.OBS_THEME_WINDOWS_PREFIX_PATTERN)

    if windows_name ~= nil then
        return windows_name
    end

    for _index, prefix_pattern in ipairs(consts.OBS_THEME_OTHER_SYSTEM_PREFIX_PATTERNS) do
        if string.match(raw_name, prefix_pattern) then
            return nil
        end
    end

    return raw_name
end

local function format_color(red, green, blue)
    return string.format(consts.OBS_THEME_COLOR_TEMPLATE, red, green, blue)
end

local function parse_rgb(value)
    local red, green, blue = string.match(value, consts.OBS_THEME_RGB_PATTERN)

    if red == nil then
        return nil
    end

    local channels = {tonumber(red), tonumber(green), tonumber(blue)}

    for channel_index, channel in ipairs(channels) do
        if channel == nil then
            return nil
        end

        channels[channel_index] = math.max(0, math.min(consts.OBS_THEME_MAX_CHANNEL, math.floor(channel + 0.5)))
    end

    return format_color(channels[1], channels[2], channels[3])
end

local function parse_color(value)
    local hex = string.match(value, consts.OBS_THEME_HEX_PATTERN)

    if hex ~= nil then
        return '#' .. string.lower(hex)
    end

    return parse_rgb(value)
end

function theme_file.read_meta(text)
    local block = string.match(strip_comments(text), consts.OBS_THEME_META_BLOCK_PATTERN)

    if block == nil then
        return nil
    end

    local meta = {}

    for field, value in string.gmatch(block, consts.OBS_THEME_META_FIELD_PATTERN) do
        meta[field] = value
    end

    if meta.id == nil or meta.id == '' then
        return nil
    end

    local is_dark = nil

    if meta.dark == 'true' then
        is_dark = true
    elseif meta.dark == 'false' then
        is_dark = false
    end

    return {
        id = meta.id,
        extends = meta.extends ~= '' and meta.extends or nil,
        is_dark = is_dark,
    }
end

function theme_file.merge_variables(variables, text)
    for block in string.gmatch(strip_comments(text), consts.OBS_THEME_VARIABLES_BLOCK_PATTERN) do
        for raw_name, raw_value in string.gmatch(block, consts.OBS_THEME_VARIABLE_PATTERN) do
            local name = read_variable_name(raw_name)

            if name ~= nil then
                variables[name] = trim(string.gsub(raw_value, consts.OBS_THEME_EDITABLE_PATTERN, ''))
            end
        end
    end

    return variables
end

function theme_file.resolve_color(variables, name)
    local value = variables[name]

    for _step = 1, consts.OBS_THEME_MAX_REFERENCE_DEPTH do
        if value == nil then
            return nil
        end

        local reference = string.match(value, consts.OBS_THEME_REFERENCE_PATTERN)

        if reference == nil then
            return parse_color(value)
        end

        value = variables[reference]
    end

    return nil
end

return theme_file
