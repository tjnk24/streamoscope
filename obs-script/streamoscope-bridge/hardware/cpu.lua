local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local percent = require('streamoscope-bridge.utils.percent')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local Cpu = {}

Cpu.__index = Cpu

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
        } StatsBridgeCpuCounterValue;

        int32_t PdhOpenQueryW(const uint16_t *source, uintptr_t userData, void **query);
        int32_t PdhAddEnglishCounterW(void *query, const uint16_t *path, uintptr_t userData, void **counter);
        int32_t PdhCollectQueryData(void *query);
        int32_t PdhGetFormattedCounterValue(void *counter, uint32_t format, uint32_t *counterType, StatsBridgeCpuCounterValue *value);
        int32_t PdhCloseQuery(void *query);
    ]])
end

local function open_query(self)
    local query = ffi.new('void *[1]')

    if self.pdh.PdhOpenQueryW(nil, 0, query) ~= 0 then
        return
    end

    local counter = ffi.new('void *[1]')

    if self.pdh.PdhAddEnglishCounterW(query[0], wide_string.from_text(consts.CPU_COUNTER_PATH), 0, counter) ~= 0 then
        self.pdh.PdhCloseQuery(query[0])

        return
    end

    self.pdh.PdhCollectQueryData(query[0])

    self.query = query
    self.counter = counter
end

function Cpu.new()
    local self = setmetatable({}, Cpu)

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

    return self
end

function Cpu:close()
    if self.query ~= nil then
        self.pdh.PdhCloseQuery(self.query[0])
    end

    self.query = nil
end

function Cpu:sample()
    if self.query == nil or self.pdh.PdhCollectQueryData(self.query[0]) ~= 0 then
        return nil
    end

    local value = ffi.new('StatsBridgeCpuCounterValue')

    if self.pdh.PdhGetFormattedCounterValue(self.counter[0], consts.PDH_FORMAT_DOUBLE_UNCAPPED, nil, value) ~= 0 then
        return nil
    end

    if not consts.PDH_VALID_DATA_STATUSES[value.status] then
        return nil
    end

    return {usage = percent.round(value.doubleValue)}
end

return Cpu
