local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local text_file = require('streamoscope-bridge.utils.text_file')
local environment = require('streamoscope-bridge.utils.environment')
local process = require('streamoscope-bridge.utils.process')

local opened_command_line = 'nothing'

process.start_hidden = function(command_line)
    opened_command_line = command_line

    return true
end

local data_directory = environment.get('LOCALAPPDATA') .. '\\streamoscope'
local journal_path = data_directory .. '\\logs\\streamoscope.log'
local old_journal_path = data_directory .. '\\logs\\streamoscope.old.log'

local function journal_has(text)
    return string.find(text_file.read(journal_path) or '', text, 1, true) ~= nil
end

local function send_lines(lines)
    store['StreamoScope/JournalLines'] = lines
    timers[250]()
end

local function send_command(command)
    store['StreamoScope/JournalCommand'] = command
    timers[250]()
end

record('loadedLine', journal_has('loaded version=manual bridge='))
record('hasUtcOffset', string.find(text_file.read(journal_path) or '', 'utc=[+-]%d%d:%d%d') ~= nil)

for _index, callback in ipairs(event_callbacks) do
    callback(5)
end

record('streamEvent', journal_has('stream started'))

send_lines('panel first\31panel\tsecond')
record('linesLeft', store['StreamoScope/JournalLines'] ~= nil)
record('firstLine', journal_has('panel first\r\n'))
record('controlCharacterCleaned', journal_has('panel second\r\n'))

send_lines(string.rep('x', 5000))
record('longLineCut', journal_has(string.rep('x', 4096) .. '\r\n'))

fake_now = fake_now + 299
timers[250]()
record('aliveTooEarly', journal_has('alive'))

fake_now = fake_now + 2
timers[250]()
record('aliveInTime', journal_has('alive'))

stub_outputs[1] = {name = 'adv_stream', server = 'rtmp://secret.example.com/app', is_active = true, total_bytes = 0, dropped = 2, total_frames = 100, congestion = 0.25, is_reconnecting = false}
stub_outputs[2] = {name = 'multi-output', server = 'rtmp://secret.example.com/app', is_active = true, total_bytes = 0, dropped = 0, total_frames = 0, congestion = 0, is_reconnecting = false}
stub_outputs[3] = {name = 'multi-output', server = 'rtmp://secret.example.com/app', is_active = true, total_bytes = 0, dropped = 0, total_frames = 0, congestion = 0, is_reconnecting = true}
stub_outputs[4] = {name = 'my output', server = 'rtmp://secret.example.com/app', is_active = true, total_bytes = 0, dropped = 0, total_frames = 0, congestion = 0, is_reconnecting = false}
stub_outputs[5] = {name = 'stopped', server = 'rtmp://secret.example.com/app', is_active = false, total_bytes = 0, dropped = 0, total_frames = 0, congestion = 0, is_reconnecting = false}
stub_outputs[6] = {name = 'multi-output', server = 'rtmp://secret.example.com/app', id = 'a3f91c07', is_active = true, total_bytes = 0, dropped = 0, total_frames = 0, congestion = 0, is_reconnecting = false}

fake_now = fake_now + 10
timers[250]()

stub_outputs[1].total_bytes = 10000000
fake_now = fake_now + 10
timers[250]()

record('outputStats', journal_has('STAT  adv_stream kbps_avg=8000 dropped=2 frames=100 congestion=25% reconnecting=false'))
record('sameNameOutput', journal_has('STAT  multi-output#2 kbps_avg=0 dropped=0 frames=0 congestion=0% reconnecting=true'))
record('outputIdLabel', journal_has('STAT  multi-output@a3f91c07 kbps_avg='))
record('unsafeNameCleaned', journal_has('STAT  my_output kbps_avg='))
record('inactiveSkipped', not journal_has('stopped kbps_avg'))
record('serverHidden', not journal_has('secret.example.com'))

stub_outputs[1] = nil
stub_outputs[2] = nil
stub_outputs[3] = nil
stub_outputs[4] = nil
stub_outputs[5] = nil
stub_outputs[6] = nil

local size_after_stream = text_file.size(journal_path)

fake_now = fake_now + 10
timers[250]()
record('silentWithoutStream', text_file.size(journal_path) == size_after_stream)

text_file.write(data_directory .. '\\update-status.json', '{"version":"2.0.0","stage":"failed","percent":0,"error":"signature","updated":1}')
timers[1000]()
record('updateFailure', journal_has('stage=failed version=2.0.0 error=signature'))

local size_before_repeat = text_file.size(journal_path)

timers[1000]()
record('updateLoggedOnce', text_file.size(journal_path) == size_before_repeat)

send_command('off')
record('commandLeft', store['StreamoScope/JournalCommand'] ~= nil)
record('settingOff', text_file.read(data_directory .. '\\journal.txt'))

local size_when_off = text_file.size(journal_path)

send_lines('written while off')
record('nothingWrittenWhenOff', text_file.size(journal_path) == size_when_off)

send_command('open')
record('openedCommandLine', opened_command_line)

send_command('on')
record('settingOn', text_file.read(data_directory .. '\\journal.txt'))
record('turnedOnLine', journal_has('journal turned on'))

store['StreamoScope/JournalLines'] = 'stale line from the profile file'
store['StreamoScope/JournalCommand'] = 'open'
opened_command_line = 'nothing'
script_unload()
script_load({})
timers[250]()
record('staleLinesDropped', not journal_has('stale line from the profile file'))
record('staleCommandDropped', opened_command_line)

local long_line = string.rep('y', 4000)
local batch = {}

for line_number = 1, 500 do
    batch[line_number] = long_line
end

local joined_batch = table.concat(batch, '\31')

for _batch_number = 1, 6 do
    send_lines(joined_batch)
end

record('rotated', text_file.exists(old_journal_path))
record('currentWithinLimit', text_file.size(journal_path) <= 5 * 1024 * 1024)
record('oldWithinLimit', text_file.size(old_journal_path) <= 5 * 1024 * 1024)

script_unload()

return table.concat(results, '\n')
