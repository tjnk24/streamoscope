local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local ffi = require('ffi')
local OutputFingerprint = require('streamoscope-bridge.outputs.output_fingerprint')

stub_outputs[1] = {
    name = 'multi-output',
    server = 'rtmp://streamer:secret-password@live.example.com/app/secret-key-in-path',
    id = 'a3f91c07',
    key_id = 'b7c2e410',
    is_active = true,
    total_bytes = 1250000,
    dropped = 3,
    total_frames = 600,
    duration_ms = 10000,
    congestion = 0.5,
    is_reconnecting = false,
}

stub_outputs[2] = {name = 'fallback-output', server = 'rtmp://fallback.example.com/app'}
stub_main_key_id = 'c4d8e2f1'

timers[1000]()

local payload = store['StreamoScope/PluginOutputs'] or ''

record('sampledAtMs', string.match(payload, '"sampledAtMs":(%d+)'))
record('outputWithStats', string.match(payload, '{"id":"%x+","keyId":"%x+","name":"multi%-output"[^%]]-}}'))
record('mainKeyId', string.match(payload, '"mainKeyId":"(%x+)"'))
record('fallbackOutput', string.match(payload, '{"name":"fallback%-output"[^}]*}'))
record('secretsHidden', string.find(payload, 'secret', 1, true) == nil)

local fingerprint = OutputFingerprint.new()
local key_pointer = ffi.new('char[?]', #'live_key' + 1, 'live_key')

record('fingerprint', fingerprint:compute({'rtmp://live.example.com/app', 'live_key', ''}))
record('pointerFingerprint', fingerprint:compute({'rtmp://live.example.com/app', key_pointer, ''}))
record('otherKeyFingerprint', fingerprint:compute({'rtmp://live.example.com/app', 'other_key', ''}))
record('keyFingerprint', fingerprint:compute_key('live_key', ''))
record('pointerKeyFingerprint', fingerprint:compute_key(key_pointer, ''))
record('emptyKeyFingerprint', fingerprint:compute_key('', ''))

fingerprint:close()

record('closedFingerprint', fingerprint:compute({'rtmp://live.example.com/app', 'live_key', ''}))

script_unload()

return table.concat(results, '\n')
