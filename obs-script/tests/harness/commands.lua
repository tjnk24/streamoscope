local ffi = require('ffi')

pcall(ffi.cdef, 'void Sleep(uint32_t milliseconds);')

local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local text_file = require('streamoscope-bridge.utils.text_file')
local environment = require('streamoscope-bridge.utils.environment')
local payload = store['StreamoScope/PluginOutputs']

record('scriptPath', script_path())
record('description', script_description())
record('bridgeVersion', string.match(payload, '"bridgeVersion":(%d+)'))
record('update', string.match(payload, '"update":(%b{})') or 'none')

local marker = environment.get('MARKER_FILE')
local setting_file = environment.get('LOCALAPPDATA') .. '\\streamoscope\\auto-update.txt'

local function take_marker()
    local content = text_file.read(marker)

    if content ~= nil and content ~= '' then
        text_file.write(marker, '')

        return content
    end

    return nil
end

local function wait_marker()
    for _attempt = 1, 75 do
        local content = take_marker()

        if content ~= nil then
            return content
        end

        ffi.C.Sleep(200)
    end

    return 'nothing'
end

if marker ~= nil and marker ~= '' then
    store['StreamoScope/UpdateCommand'] = 'install:9.9.9'
    script_unload()
    script_load({})
    record('staleCommandLeftAfterLoad', store['StreamoScope/UpdateCommand'] ~= nil)

    timers[250]()
    record('tickBeforeDelay', take_marker() or 'nothing')

    store['StreamoScope/UpdateCommand'] = 'install:1.2.3'
    timers[250]()
    record('installCommandLeft', store['StreamoScope/UpdateCommand'] ~= nil)
    record('installCalledWith', wait_marker())

    store['StreamoScope/UpdateCommand'] = 'install:1.2; calc'
    timers[250]()
    record('badCommandLeft', store['StreamoScope/UpdateCommand'] ~= nil)

    fake_now = fake_now + 61
    timers[250]()
    record('autoCalledWith', wait_marker())

    store['StreamoScope/UpdateCommand'] = 'auto:off'
    timers[250]()
    record('settingAfterOff', text_file.read(setting_file))

    fake_now = fake_now + 24 * 60 * 60 + 1
    timers[250]()
    ffi.C.Sleep(3000)
    record('afterOffCalledWith', take_marker() or 'nothing')

    store['StreamoScope/UpdateCommand'] = 'auto:on'
    timers[250]()
    record('settingAfterOn', text_file.read(setting_file))

    fake_now = fake_now + 24 * 60 * 60 + 1
    timers[250]()
    record('afterOnCalledWith', wait_marker())
end

for _index, callback in ipairs(event_callbacks) do
    callback(obslua.OBS_FRONTEND_EVENT_FINISHED_LOADING)
end

fake_now = fake_now + 14
store['StreamoScope/UpdateCommand'] = 'healthy:9.9.9'
timers[250]()

local journal_text = text_file.read(environment.get('LOCALAPPDATA') .. '\\streamoscope\\logs\\streamoscope.log') or ''

record('dockReportLogged', string.find(journal_text, 'updater  dock reported healthy version=9.9.9 after_loading=14s', 1, true) ~= nil)

timers[1000]()
script_unload()

return table.concat(results, '\n')
