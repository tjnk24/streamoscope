local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local process = require('streamoscope-bridge.utils.process')
local opened_command_lines = {}

process.start_hidden = function(command_line)
    opened_command_lines[#opened_command_lines + 1] = command_line

    return true
end

store['StreamoScope/OpenUrlCommand'] = 'https://github.com/tjnk24/streamoscope/releases'
script_unload()
script_load({})
timers[250]()
record('staleCommandLeft', store['StreamoScope/OpenUrlCommand'] ~= nil)
record('staleCommandOpened', #opened_command_lines)

store['StreamoScope/OpenUrlCommand'] = 'https://github.com/tjnk24/streamoscope/releases'
timers[250]()
record('freshCommandOpened', #opened_command_lines)

store['StreamoScope/OpenUrlCommand'] = 'http://127.0.0.1:3063/releases/tag/v1.2.3'
timers[250]()
record('testServerOpened', #opened_command_lines)

for _index, rejected_url in ipairs({
    'http://127.0.0.1:1@evil.example/releases',
    'http://127.0.0.1:/releases',
    'http://127.0.0.1:3063',
    'https://github.com/tjnk24/streamoscope.evil.example/',
    'https://evil.example/tjnk24/streamoscope/',
    'https://github.com/tjnk24/streamoscope/releases" --evil',
    'https://github.com/tjnk24/streamoscope/' .. string.rep('a', 2048),
}) do
    store['StreamoScope/OpenUrlCommand'] = rejected_url
    timers[250]()
end

record('rejectedOpened', #opened_command_lines)
record('rejectedCommandLeft', store['StreamoScope/OpenUrlCommand'] ~= nil)

script_unload()

return table.concat(results, '\n')
