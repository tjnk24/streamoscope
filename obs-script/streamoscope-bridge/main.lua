local obs = obslua

local consts = require('streamoscope-bridge.consts')
local Gpu = require('streamoscope-bridge.hardware.gpu')
local Journal = require('streamoscope-bridge.journal.journal')
local MultiRtmpTargets = require('streamoscope-bridge.outputs.multi_rtmp_targets')
local StreamOutputs = require('streamoscope-bridge.outputs.stream_outputs')
local publisher = require('streamoscope-bridge.publisher')
local release_links = require('streamoscope-bridge.update.release_links')
local Updater = require('streamoscope-bridge.update.updater')

local sources = {}

local function create_safely(Source, ...)
    local created, source = pcall(Source.new, ...)

    return created and source or nil
end

local function open_sources()
    local journal = create_safely(Journal)

    sources = {
        journal = journal,
        gpu = create_safely(Gpu),
        stream_outputs = create_safely(StreamOutputs),
        multi_rtmp_targets = create_safely(MultiRtmpTargets, journal),
        updater = create_safely(Updater, journal),
    }
end

local function close_sources()
    for _key, source in pairs(sources) do
        pcall(source.close, source)
    end

    sources = {}
end

local function handle_commands()
    if sources.updater ~= nil then
        pcall(sources.updater.handle_command, sources.updater)
        pcall(sources.updater.handle_schedule, sources.updater)
    end

    if sources.journal ~= nil then
        pcall(sources.journal.handle_command, sources.journal)
        pcall(sources.journal.handle_schedule, sources.journal, sources)
    end

    pcall(release_links.handle_command)
end

local function publish()
    pcall(publisher.publish, sources)
end

local function on_event(event)
    if sources.journal ~= nil then
        pcall(sources.journal.handle_frontend_event, sources.journal, event)
    end

    if event == obs.OBS_FRONTEND_EVENT_PROFILE_CHANGING then
        publisher.clear()
    elseif event == obs.OBS_FRONTEND_EVENT_PROFILE_CHANGED or event == obs.OBS_FRONTEND_EVENT_SCENE_COLLECTION_CHANGED then
        if event == obs.OBS_FRONTEND_EVENT_PROFILE_CHANGED and sources.multi_rtmp_targets ~= nil then
            pcall(sources.multi_rtmp_targets.handle_profile_change, sources.multi_rtmp_targets)
        end

        publish()
    elseif event == obs.OBS_FRONTEND_EVENT_SCRIPTING_SHUTDOWN then
        obs.timer_remove(publish)
        obs.timer_remove(handle_commands)
        publisher.clear()
        close_sources()
    end
end

function script_description()
    local icon = string.format(consts.DESCRIPTION_ICON_HTML, script_path())

    if string.sub(obs.obs_get_locale(), 1, 2) == 'ru' then
        return icon .. 'Сообщает панели StreamoScope, на какую площадку стримят выходы плагинов (obs-multi-rtmp и любые другие) ' ..
            'и статистику каждого из них, загрузку видеокарты и занятую память системы. Передаёт только адрес сервера без пути и ключа ' ..
            'и короткие отпечатки: по ним панель узнаёт выход и замечает цель с тем же ключом, что у основной трансляции, ' ..
            'а ключ по ним не восстановить. Цели obs-multi-rtmp ' ..
            'читает из настроек плагина в профиле, чтобы их карточки с названиями были видны ещё до эфира.'
    end

    return icon .. 'Tells the StreamoScope dock which platform plugin outputs stream to (obs-multi-rtmp and any other) ' ..
        'and the statistics of each, the GPU load and the system memory in use. Only the server address is passed, without the path ' ..
        'or the key, plus short fingerprints that let the dock recognise the output and spot a target with the same key ' ..
        'as the main stream; they cannot be turned back into the key. ' ..
        'It reads the obs-multi-rtmp targets from the plugin settings in the profile, so their cards and names show up before you go live.'
end

function script_load(_settings)
    open_sources()
    pcall(release_links.discard_stale_command)

    if sources.updater ~= nil then
        pcall(sources.updater.discard_stale_command, sources.updater)
    end

    obs.obs_frontend_add_event_callback(on_event)
    obs.timer_add(publish, consts.PUBLISH_INTERVAL_MS)
    obs.timer_add(handle_commands, consts.COMMAND_INTERVAL_MS)
    publish()
end

function script_unload()
    obs.timer_remove(publish)
    obs.timer_remove(handle_commands)
    close_sources()
end
