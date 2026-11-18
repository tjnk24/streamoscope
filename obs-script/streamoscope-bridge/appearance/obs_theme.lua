local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local theme_file = require('streamoscope-bridge.appearance.theme_file')
local json = require('streamoscope-bridge.utils.json')
local text_file = require('streamoscope-bridge.utils.text_file')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local ObsTheme = {}

ObsTheme.__index = ObsTheme

local function define_types()
    local declarations = {
        'void *obs_frontend_get_user_config(void);',
        'void *obs_frontend_get_app_config(void);',
        'void *obs_frontend_get_global_config(void);',
        'bool obs_frontend_is_theme_dark(void);',
        'char *obs_frontend_get_current_profile_path(void);',
        'const char *config_get_string(void *config, const char *section, const char *name);',
        'void bfree(void *pointer);',
        'uint32_t GetModuleFileNameW(void *module, uint16_t *buffer, uint32_t size);',
    }

    for _index, declaration in ipairs(declarations) do
        pcall(ffi.cdef, declaration)
    end
end

local function take_pointer(pointer)
    if pointer == nil then
        return nil
    end

    return pointer
end

local function call_optional(library, function_name)
    local found, exported = pcall(function()
        return library[function_name]
    end)

    if not found or exported == nil then
        return nil
    end

    return exported()
end

local function read_program_path()
    local buffer = ffi.new('uint16_t[?]', consts.OBS_THEME_PROGRAM_PATH_MAX_CHARACTERS)
    local length = ffi.C.GetModuleFileNameW(nil, buffer, consts.OBS_THEME_PROGRAM_PATH_MAX_CHARACTERS)

    if length == 0 or length >= consts.OBS_THEME_PROGRAM_PATH_MAX_CHARACTERS then
        return nil
    end

    return wide_string.to_text(buffer)
end

local function read_config_text(self, config, section, name)
    if config == nil then
        return nil
    end

    local pointer = self.libobs.config_get_string(config, section, name)

    if pointer == nil or pointer[0] == 0 then
        return nil
    end

    return ffi.string(pointer)
end

local function read_user_config(self)
    return take_pointer(call_optional(self.frontend, 'obs_frontend_get_user_config'))
        or take_pointer(call_optional(self.frontend, 'obs_frontend_get_global_config'))
end

local function read_theme_id(self, user_config)
    return read_config_text(self, user_config, consts.OBS_THEME_CONFIG_SECTION, consts.OBS_THEME_CONFIG_NAME)
        or consts.OBS_THEME_DEFAULT_ID
end

local function read_font_scale(self, user_config)
    local font_scale = read_config_text(self, user_config, consts.OBS_THEME_CONFIG_SECTION, consts.OBS_FONT_SCALE_CONFIG_NAME)

    return font_scale ~= nil and tonumber(font_scale) or nil
end

local function strip_trailing_separator(path)
    return (string.gsub(path, consts.PATH_TRAILING_SEPARATOR_PATTERN, ''))
end

local function resolve_path(self, path)
    for _index, absolute_pattern in ipairs(consts.OBS_THEME_ABSOLUTE_PATH_PATTERNS) do
        if string.match(path, absolute_pattern) then
            return path
        end
    end

    local program_directory = self.program_path ~= nil and string.match(self.program_path, consts.OBS_THEME_PARENT_DIRECTORY_PATTERN) or nil

    return program_directory ~= nil and program_directory .. '/' .. path or path
end

local function read_install_directory(self)
    local program_root = self.program_path ~= nil and string.match(self.program_path, consts.OBS_THEME_THREE_LEVELS_UP_PATTERN) or nil

    return program_root ~= nil and program_root .. consts.OBS_THEME_INSTALL_DIRECTORY or nil
end

local function read_user_directory(self)
    local app_config = take_pointer(call_optional(self.frontend, 'obs_frontend_get_app_config'))
    local location = read_config_text(self, app_config, consts.OBS_LOCATIONS_SECTION, consts.OBS_CONFIGURATION_LOCATION_NAME)

    if location ~= nil then
        return strip_trailing_separator(resolve_path(self, location)) .. consts.OBS_THEME_USER_DIRECTORY
    end

    local profile_pointer = take_pointer(call_optional(self.frontend, 'obs_frontend_get_current_profile_path'))

    if profile_pointer == nil then
        return nil
    end

    local profile_path = ffi.string(profile_pointer)

    self.libobs.bfree(profile_pointer)

    local config_directory = string.match(strip_trailing_separator(resolve_path(self, profile_path)), consts.OBS_THEME_THREE_LEVELS_UP_PATTERN)

    return config_directory ~= nil and config_directory .. consts.OBS_THEME_PROFILE_THEMES_DIRECTORY or nil
end

local function list_directories(self)
    local directories = {}
    local install_directory = read_install_directory(self)
    local user_directory = read_user_directory(self)

    if install_directory ~= nil then
        directories[#directories + 1] = install_directory
    end

    if user_directory ~= nil then
        directories[#directories + 1] = user_directory
    end

    return directories
end

local function index_themes(self)
    local themes = {}

    for _directory_index, directory in ipairs(list_directories(self)) do
        for _mask_index, mask in ipairs(consts.OBS_THEME_FILE_MASKS) do
            for _name_index, file_name in ipairs(text_file.list(directory, mask)) do
                local text = text_file.read(directory .. '/' .. file_name, consts.OBS_THEME_MAX_READ_BYTES)
                local meta = text ~= nil and theme_file.read_meta(text) or nil

                if meta ~= nil and themes[meta.id] == nil then
                    themes[meta.id] = {meta = meta, text = text}
                end
            end
        end
    end

    return themes
end

local function collect_chain(themes, id)
    local chain = {}
    local current_id = id

    for _step = 1, consts.OBS_THEME_MAX_CHAIN_DEPTH do
        local theme = themes[current_id]

        if theme == nil then
            return nil
        end

        table.insert(chain, 1, theme)
        current_id = theme.meta.extends

        if current_id == nil then
            return chain
        end
    end

    return nil
end

local function read_colors(chain)
    local variables = {}

    for _index, theme in ipairs(chain) do
        theme_file.merge_variables(variables, theme.text)
    end

    local colors = {}
    local has_colors = false

    for color_name, variable_names in pairs(consts.OBS_THEME_COLOR_VARIABLES) do
        for _index, variable_name in ipairs(variable_names) do
            local color = theme_file.resolve_color(variables, variable_name)

            if color ~= nil then
                colors[color_name] = color
                has_colors = true

                break
            end
        end
    end

    return has_colors and colors or nil
end

local function read_meta_darkness(chain)
    for theme_index = #chain, 1, -1 do
        local is_dark = chain[theme_index].meta.is_dark

        if is_dark ~= nil then
            return is_dark
        end
    end

    return nil
end

local function describe(self, id)
    local themes = index_themes(self)
    local chain = collect_chain(themes, id) or collect_chain(themes, consts.OBS_THEME_DEFAULT_ID)
    local is_dark_read, frontend_is_dark = pcall(call_optional, self.frontend, 'obs_frontend_is_theme_dark')
    local is_dark = nil

    if is_dark_read and type(frontend_is_dark) == 'boolean' then
        is_dark = frontend_is_dark
    elseif chain ~= nil then
        is_dark = read_meta_darkness(chain)
    end

    return {
        id = id,
        isDark = is_dark,
        colors = chain ~= nil and read_colors(chain) or nil,
    }
end

local function read_dock_file_path()
    local dock_directory = script_path() .. consts.OBS_THEME_DOCK_DIRECTORY

    if not text_file.exists(dock_directory .. consts.OBS_THEME_DOCK_PAGE_FILE) then
        return nil
    end

    return dock_directory .. consts.OBS_THEME_DOCK_FILE
end

local function write_dock_file(self)
    if self.dock_file_path ~= nil and self.theme ~= nil then
        text_file.replace(self.dock_file_path, string.format(consts.OBS_THEME_DOCK_FILE_TEMPLATE, json.encode(self.theme)))
    end
end

function ObsTheme.new()
    local self = setmetatable({}, ObsTheme)

    define_types()

    local libobs_loaded, libobs = pcall(ffi.load, 'obs')
    local frontend_loaded, frontend = pcall(ffi.load, 'obs-frontend-api')

    if not libobs_loaded or not frontend_loaded then
        return self
    end

    self.libobs = libobs
    self.frontend = frontend
    self.program_path = read_program_path()
    self.dock_file_path = read_dock_file_path()

    return self
end

function ObsTheme:read()
    if self.libobs == nil or self.frontend == nil then
        return nil
    end

    local user_config = read_user_config(self)
    local id = read_theme_id(self, user_config)
    local font_scale = read_font_scale(self, user_config)
    local is_changed = false

    if id ~= self.theme_id then
        local described, theme = pcall(describe, self, id)

        self.theme_id = id
        self.theme = described and theme or nil
        is_changed = true
    end

    if self.theme ~= nil and self.theme.fontScale ~= font_scale then
        self.theme.fontScale = font_scale
        is_changed = true
    end

    if is_changed then
        pcall(write_dock_file, self)
    end

    return self.theme
end

function ObsTheme:close()
    self.libobs = nil
    self.frontend = nil
    self.theme_id = nil
    self.theme = nil
end

return ObsTheme
