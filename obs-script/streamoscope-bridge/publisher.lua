local obs = obslua

local consts = require('streamoscope-bridge.consts')
local system_memory = require('streamoscope-bridge.hardware.system_memory')
local targets = require('streamoscope-bridge.outputs.targets')
local json = require('streamoscope-bridge.utils.json')

local publisher = {}

local function sample_safely(sample, ...)
    local sampled, result = pcall(sample, ...)

    return sampled and result or nil
end

local function describe_update(updater)
    return {
        available = updater:is_available(),
        status = updater:read_status() or json.null,
        rolledBackVersion = updater:read_rolled_back_version(),
        stubVersion = updater:read_stub_version(),
    }
end

local function build_payload(sources)
    local outputs_read, outputs, sampled_at_ms = pcall(targets.read, sources.stream_outputs)
    local configured_read, configured_targets = pcall(targets.read_configured, sources.multi_rtmp_targets)
    local stream_outputs = sources.stream_outputs

    return {
        bridgeVersion = consts.BRIDGE_VERSION,
        updated = os.time(),
        sampledAtMs = outputs_read and sampled_at_ms or nil,
        sceneCollection = obs.obs_frontend_get_current_scene_collection(),
        outputs = json.array(outputs_read and outputs or {}),
        configuredTargets = json.array(configured_read and configured_targets or {}),
        mainKeyId = stream_outputs ~= nil and sample_safely(stream_outputs.read_main_key_id, stream_outputs) or nil,
        gpu = sources.gpu ~= nil and sample_safely(sources.gpu.sample, sources.gpu) or nil,
        systemMemory = sample_safely(system_memory.sample),
        update = sources.updater ~= nil and sample_safely(describe_update, sources.updater) or nil,
        theme = sources.obs_theme ~= nil and sample_safely(sources.obs_theme.read, sources.obs_theme) or nil,
    }
end

function publisher.publish(sources)
    local config = obs.obs_frontend_get_profile_config()

    local payload = build_payload(sources)

    if sources.journal ~= nil then
        sample_safely(sources.journal.track_payload, sources.journal, payload)
    end

    if config ~= nil then
        obs.config_set_string(config, consts.PARAMETER_SECTION, consts.PARAMETER_NAME, json.encode(payload))
    end
end

function publisher.clear()
    local config = obs.obs_frontend_get_profile_config()

    if config ~= nil then
        obs.config_remove_value(config, consts.PARAMETER_SECTION, consts.PARAMETER_NAME)
    end
end

return publisher
