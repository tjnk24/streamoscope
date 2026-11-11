local consts = require('streamoscope-bridge.consts')

local json = {}

json.null = setmetatable({}, {})

function json.array(items)
    return setmetatable(items, consts.JSON_ARRAY_METATABLE)
end

local function encode_string(value)
    local escaped = string.gsub(value, consts.JSON_ESCAPED_CHARACTER_PATTERN, function(character)
        return string.format(consts.JSON_UNICODE_ESCAPE_TEMPLATE, string.byte(character))
    end)

    return '"' .. escaped .. '"'
end

local function encode_number(value)
    if value == math.floor(value) then
        return string.format(consts.JSON_INTEGER_TEMPLATE, value)
    end

    return string.format(consts.JSON_NUMBER_TEMPLATE, value)
end

function json.encode(value)
    if value == json.null then
        return 'null'
    end

    local value_type = type(value)

    if value_type == 'string' then
        return encode_string(value)
    end

    if value_type == 'number' then
        return encode_number(value)
    end

    if value_type == 'boolean' then
        return tostring(value)
    end

    if getmetatable(value) == consts.JSON_ARRAY_METATABLE or #value > 0 then
        local items = {}

        for _index, item in ipairs(value) do
            items[#items + 1] = json.encode(item)
        end

        return '[' .. table.concat(items, ',') .. ']'
    end

    local keys = {}

    for key in pairs(value) do
        keys[#keys + 1] = key
    end

    table.sort(keys)

    local fields = {}

    for _index, key in ipairs(keys) do
        fields[#fields + 1] = encode_string(key) .. ':' .. json.encode(value[key])
    end

    return '{' .. table.concat(fields, ',') .. '}'
end

return json
