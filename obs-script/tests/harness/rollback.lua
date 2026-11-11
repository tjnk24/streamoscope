local function send(command)
    if command ~= '' then
        store['StreamoScope/UpdateCommand'] = command
        timers[250]()
    end
end

send('__EARLY_COMMAND__')

if __FINISHED__ then
    for _index, callback in ipairs(event_callbacks) do
        callback(99)
    end
end

fake_now = fake_now + __ELAPSED__

if timers[1000] ~= nil then
    timers[1000]()
end

send('__LATE_COMMAND__')
timers[3000]()

local payload = store['StreamoScope/PluginOutputs'] or ''
local rolled_back = string.match(payload, '"rolledBackVersion":"([^"]*)"') or '-'
local available = string.match(payload, '"available":(%a+)') or '-'
local stub = string.match(payload, '"stubVersion":(%d+)') or '-'
local result = script_path() .. '|' .. rolled_back .. '|' .. available .. '|' .. stub

script_unload()

return result
