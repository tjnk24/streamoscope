local results = {}

local function record(name, value)
    results[#results + 1] = name .. '=' .. tostring(value)
end

local ffi = require('ffi')
local ObsTheme = require('streamoscope-bridge.appearance.obs_theme')
local publisher = require('streamoscope-bridge.publisher')
local text_file = require('streamoscope-bridge.utils.text_file')

local function ensure_directories(base, relative_path)
    local path = base

    for part in string.gmatch(relative_path, '[^/]+') do
        path = path .. '/' .. part
        text_file.ensure_directory(path)
    end

    return path
end

local function to_text(value)
    return value ~= nil and ffi.new('char[?]', #value + 1, value) or nil
end

local function describe_colors(theme)
    if theme == nil or theme.colors == nil then
        return 'nil'
    end

    local names = {}

    for name in pairs(theme.colors) do
        names[#names + 1] = name
    end

    table.sort(names)

    local described = {}

    for _index, name in ipairs(names) do
        described[#described + 1] = name .. ':' .. theme.colors[name]
    end

    return table.concat(described, ',')
end

local install_themes = ensure_directories(root, 'obs/data/obs-studio/themes')
local user_themes = ensure_directories(root, 'roaming/obs-studio/themes')
local old_user_themes = ensure_directories(root, 'config30/obs-studio/themes')
local portable_user_themes = ensure_directories(root, 'obs/config/obs-studio/themes')

ensure_directories(root, 'config30/obs-studio/basic/profiles/Main')
ensure_directories(root, 'empty/bin/64bit')

text_file.write(install_themes .. '/Base.obt', table.concat({
    '/* Base theme */',
    '@OBSThemeMeta {',
    "    name: 'Base';",
    "    id: 'test.Base';",
    "    dark: 'true';",
    '}',
    '',
    '@OBSThemeVars {',
    '    /* --text: #000000; */',
    '    --grey: #112233;',
    '    --bg_window: var(--grey);',
    '    --bg_base: rgb(10, 20, 30);',
    '    --text: #FFFFFF;',
    '    --text_muted: var(--missing);',
    '    --palette_highlight: #ABCDEF;',
    '    --border_color: #000000;',
    '    --os_win_border_color: #445566;',
    '    --input_bg: #222222;',
    '    --os_mac_input_bg: #ffffff;',
    '    --input_border: calc(1px + 2px);',
    '}',
    '',
    '.QWidget { color: var(--text); }',
}, '\n'))

text_file.write(install_themes .. '/Base_Default.ovt', table.concat({
    '@OBSThemeMeta {',
    "    name: 'Default';",
    "    id: 'com.obsproject.Yami.Original';",
    "    extends: 'test.Base';",
    '}',
}, '\n'))

text_file.write(install_themes .. '/notes.txt', "@OBSThemeMeta { id: 'test.Text'; }")

text_file.write(user_themes .. '/Variant.ovt', table.concat({
    '@OBSThemeMeta {',
    '    name: "Variant";',
    '    id: "test.Base.Variant";',
    '    extends: "test.Base";',
    '    dark: "false";',
    '}',
    '',
    '@OBSThemeVars {',
    '    --grey: rgb(200, 201, 202) !editable;',
    '}',
}, '\n'))

text_file.write(user_themes .. '/Shadow.obt', table.concat({
    '@OBSThemeMeta {',
    "    name: 'Shadow';",
    "    id: 'test.Base';",
    '}',
    '',
    '@OBSThemeVars {',
    '    --bg_base: #ffffff;',
    '}',
}, '\n'))

text_file.write(user_themes .. '/Loop.ovt', table.concat({
    '@OBSThemeMeta {',
    "    name: 'Loop';",
    "    id: 'test.Loop';",
    "    extends: 'test.Loop';",
    '}',
}, '\n'))

text_file.write(old_user_themes .. '/Old.ovt', table.concat({
    '@OBSThemeMeta {',
    "    name: 'Old';",
    "    id: 'test.Old';",
    "    extends: 'test.Base';",
    '}',
    '',
    '@OBSThemeVars {',
    '    --bg_window: #010203;',
    '}',
}, '\n'))

text_file.write(portable_user_themes .. '/Portable.ovt', table.concat({
    '@OBSThemeMeta {',
    "    name: 'Portable';",
    "    id: 'test.Portable';",
    "    extends: 'test.Base';",
    '}',
    '',
    '@OBSThemeVars {',
    '    --bg_window: #0f0e0d;',
    '}',
}, '\n'))

local user_config = {['Appearance/Theme'] = 'test.Base.Variant'}
local app_config = {['Locations/Configuration'] = string.gsub(root .. 'roaming/', '/', '\\')}
local global_config = {['Appearance/Theme'] = 'test.Old'}
local profile_path = root .. 'config30/obs-studio/basic/profiles/Main'
local freed_profile_paths = 0

local fake_libobs = {
    config_get_string = function(config, section, name) return to_text(config[section .. '/' .. name]) end,
    bfree = function() freed_profile_paths = freed_profile_paths + 1 end,
}

local modern_frontend = {
    obs_frontend_get_user_config = function() return user_config end,
    obs_frontend_get_app_config = function() return app_config end,
}

local old_frontend = {
    obs_frontend_get_global_config = function() return global_config end,
    obs_frontend_get_current_profile_path = function() return to_text(profile_path) end,
    obs_frontend_is_theme_dark = function() return true end,
}

local legacy_frontend = {
    obs_frontend_get_global_config = function() return {} end,
    obs_frontend_is_theme_dark = function() return false end,
}

local real_ffi_load = ffi.load
local current_frontend = modern_frontend

ffi.load = function(name, ...)
    if name == 'obs' then
        return fake_libobs
    end

    if name == 'obs-frontend-api' then
        return current_frontend
    end

    return real_ffi_load(name, ...)
end

local function create_theme(frontend, program_path)
    current_frontend = frontend

    local theme = ObsTheme.new()

    theme.program_path = program_path

    return theme
end

local old_theme = create_theme(old_frontend, root .. 'obs/bin/64bit/obs64.exe')
local legacy_theme = create_theme(legacy_frontend, root .. 'empty/bin/64bit/obs64.exe')

ensure_directories(root, 'dock')
text_file.write(root .. 'dock/index.html', '<!DOCTYPE html>')

local modern_theme = create_theme(modern_frontend, root .. 'obs/bin/64bit/obs64.exe')
local dock_file_path = root .. 'dock/obs-theme.js'

ffi.load = real_ffi_load

local variant = modern_theme:read()

record('variantId', variant.id)
record('variantIsDark', variant.isDark)
record('variantColors', describe_colors(variant))
record('cached', rawequal(modern_theme:read(), variant))

local dock_file = text_file.read(dock_file_path) or ''

record('dockFileGlobal', string.match(dock_file, '^window%.STREAMOSCOPE_OBS_THEME = {.*};\r\n$') ~= nil)
record('dockFileWindow', string.match(dock_file, '"window":"(#%x+)"'))

text_file.write(user_themes .. '/Variant.ovt', "@OBSThemeMeta { id: 'test.Base.Variant'; extends: 'test.Base'; }")
record('cachedColors', describe_colors(modern_theme:read()))

user_config['Appearance/Theme'] = 'test.Missing'

local missing = modern_theme:read()

record('missingId', missing.id)
record('missingIsDark', missing.isDark)
record('missingColors', describe_colors(missing))
record('dockFileAfterChange', string.match(text_file.read(dock_file_path) or '', '"window":"(#%x+)"'))

user_config['Appearance/Theme'] = nil
record('withoutSettingId', modern_theme:read().id)

user_config['Appearance/Theme'] = 'test.Loop'
record('loopColors', describe_colors(modern_theme:read()))

local old = old_theme:read()

record('oldIsDark', old.isDark)
record('oldColors', describe_colors(old))
record('freedProfilePaths', freed_profile_paths)
record('dockFileWithoutPage', string.match(text_file.read(dock_file_path) or '', '"id":"([%w%.]+)"'))

local legacy = legacy_theme:read()

record('legacyId', legacy.id)
record('legacyIsDark', legacy.isDark)
record('legacyColors', describe_colors(legacy))

user_config['Appearance/Theme'] = 'test.Base'
publisher.publish({obs_theme = modern_theme})

local payload = store['StreamoScope/PluginOutputs'] or ''

record('publishedTheme', string.match(payload, '"theme":(%b{})') ~= nil)
record('publishedWindow', string.match(payload, '"window":"(#%x+)"'))
record('publishedId', string.match(payload, '"id":"(test%.Base)"'))

local portable_config = {['Appearance/Theme'] = 'test.Portable'}
local portable_app_config = {['Locations/Configuration'] = '../../config'}

local portable_frontend = {
    obs_frontend_get_user_config = function() return portable_config end,
    obs_frontend_get_app_config = function() return portable_app_config end,
}

ffi.load = function(name, ...)
    if name == 'obs' then
        return fake_libobs
    end

    if name == 'obs-frontend-api' then
        return portable_frontend
    end

    return real_ffi_load(name, ...)
end

local portable_theme = ObsTheme.new()

ffi.load = real_ffi_load
portable_theme.program_path = root .. 'obs/bin/64bit/obs64.exe'
record('portableWindow', (portable_theme:read().colors or {}).window)

modern_theme:close()
record('afterClose', modern_theme:read())
record('withoutLibraries', setmetatable({}, ObsTheme):read())

script_unload()

return table.concat(results, '\n')
