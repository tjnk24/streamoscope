local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local gpu_names = require('streamoscope-bridge.hardware.gpu_names')
local json = require('streamoscope-bridge.utils.json')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local Gpu = {}

Gpu.__index = Gpu

local function define_types()
    pcall(ffi.cdef, [[
        typedef struct {
            uint32_t status;
            union {
                int32_t longValue;
                double doubleValue;
                int64_t largeValue;
                const char *ansiValue;
                const uint16_t *wideValue;
            };
        } StatsBridgeCounterValue;

        typedef struct {
            uint16_t *name;
            StatsBridgeCounterValue value;
        } StatsBridgeCounterItem;

        int32_t PdhOpenQueryW(const uint16_t *source, uintptr_t userData, void **query);
        int32_t PdhAddEnglishCounterW(void *query, const uint16_t *path, uintptr_t userData, void **counter);
        int32_t PdhCollectQueryData(void *query);
        int32_t PdhGetFormattedCounterArrayW(void *counter, uint32_t format, uint32_t *bufferSize, uint32_t *itemCount, StatsBridgeCounterItem *items);
        int32_t PdhCloseQuery(void *query);
    ]])
end

local function open_query(self)
    local query = ffi.new('void *[1]')

    if self.pdh.PdhOpenQueryW(nil, 0, query) ~= 0 then
        return
    end

    local counters = {}

    for key, path in pairs(consts.COUNTER_PATHS) do
        local counter = ffi.new('void *[1]')

        if self.pdh.PdhAddEnglishCounterW(query[0], wide_string.from_text(path), 0, counter) ~= 0 then
            self.pdh.PdhCloseQuery(query[0])

            return
        end

        counters[key] = counter
    end

    self.pdh.PdhCollectQueryData(query[0])

    self.query = query
    self.counters = counters
end

local function read_counter(self, counter)
    local buffer_size = ffi.new('uint32_t[1]', 0)
    local item_count = ffi.new('uint32_t[1]', 0)

    if self.pdh.PdhGetFormattedCounterArrayW(counter[0], consts.PDH_FORMAT_DOUBLE_UNCAPPED, buffer_size, item_count, nil) ~= consts.PDH_MORE_DATA then
        return {}
    end

    local buffer = ffi.new('uint8_t[?]', buffer_size[0])
    local items = ffi.cast('StatsBridgeCounterItem *', buffer)

    if self.pdh.PdhGetFormattedCounterArrayW(counter[0], consts.PDH_FORMAT_DOUBLE_UNCAPPED, buffer_size, item_count, items) ~= 0 then
        return {}
    end

    local values = {}

    for position = 0, item_count[0] - 1 do
        local item = items[position]

        if consts.PDH_VALID_DATA_STATUSES[item.value.status] then
            values[#values + 1] = {name = wide_string.to_text(item.name), value = item.value.doubleValue}
        end
    end

    return values
end

local function read_adapter_loads(self)
    local engine_loads = {}

    for _position, item in ipairs(read_counter(self, self.counters.engine)) do
        local adapter, engine, engine_type = string.match(item.name, consts.GPU_ENGINE_COUNTER_PATTERN)

        if adapter ~= nil then
            local key = adapter .. '|' .. engine
            local load = engine_loads[key] or {adapter = adapter, engine_type = engine_type, value = 0}

            load.value = load.value + item.value
            engine_loads[key] = load
        end
    end

    local adapters = {}

    for _key, load in pairs(engine_loads) do
        local adapter = adapters[load.adapter] or {usage = 0, encoder = 0, dedicated = 0, shared = 0}

        if load.engine_type == consts.GPU_RENDER_ENGINE_TYPE then
            adapter.usage = math.max(adapter.usage, load.value)
        elseif string.find(load.engine_type, consts.GPU_ENCODE_ENGINE_TYPE) or string.find(load.engine_type, consts.GPU_CODEC_ENGINE_TYPE) then
            adapter.encoder = math.max(adapter.encoder, load.value)
        end

        adapters[load.adapter] = adapter
    end

    return adapters
end

local function read_adapter_memory(self, adapters, counter, field)
    for _position, item in ipairs(read_counter(self, counter)) do
        local adapter = adapters[string.match(item.name, consts.GPU_ADAPTER_COUNTER_PATTERN)]

        if adapter ~= nil then
            adapter[field] = item.value
        end
    end
end

local function find_busiest_adapter(self, adapters)
    local busiest = nil

    for key, adapter in pairs(adapters) do
        adapter.name = self.adapter_names[string.lower(string.match(key, consts.GPU_ADAPTER_KEY_PATTERN))]

        if busiest == nil
            or adapter.usage > busiest.usage
            or (adapter.usage == busiest.usage and adapter.dedicated > busiest.dedicated) then
            busiest = adapter
        end
    end

    return busiest
end

local function round_percent(value)
    return math.floor(math.min(value, consts.MAX_PERCENT) * 10 + 0.5) / 10
end

function Gpu.new()
    local self = setmetatable({adapter_names = {}}, Gpu)

    if ffi.os ~= 'Windows' then
        return self
    end

    define_types()

    local pdh_loaded, pdh = pcall(ffi.load, 'pdh')

    if not pdh_loaded then
        return self
    end

    self.pdh = pdh
    open_query(self)

    local names_loaded, names = pcall(gpu_names.read)

    if names_loaded then
        self.adapter_names = names
    end

    return self
end

function Gpu:close()
    if self.query ~= nil then
        self.pdh.PdhCloseQuery(self.query[0])
    end

    self.query = nil
end

function Gpu:sample()
    if self.query == nil or self.pdh.PdhCollectQueryData(self.query[0]) ~= 0 then
        return nil
    end

    local adapters = read_adapter_loads(self)

    read_adapter_memory(self, adapters, self.counters.dedicated, 'dedicated')
    read_adapter_memory(self, adapters, self.counters.shared, 'shared')

    local busiest = find_busiest_adapter(self, adapters)

    if busiest == nil then
        return nil
    end

    local is_shared_memory = busiest.dedicated < consts.DEDICATED_MEMORY_MIN_BYTES

    return {
        name = busiest.name or json.null,
        usage = round_percent(busiest.usage),
        encoder = round_percent(busiest.encoder),
        memoryInBytes = math.floor(is_shared_memory and busiest.shared or busiest.dedicated),
        isSharedMemory = is_shared_memory,
    }
end

return Gpu
