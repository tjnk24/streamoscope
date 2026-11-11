local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local gpu_names = {}

local function define_types()
    pcall(ffi.cdef, [[
        typedef struct {
            uint32_t data1;
            uint16_t data2;
            uint16_t data3;
            uint8_t data4[8];
        } StatsBridgeGuid;

        typedef struct {
            uint16_t description[128];
            uint32_t vendorId;
            uint32_t deviceId;
            uint32_t subSystemId;
            uint32_t revision;
            size_t dedicatedVideoMemory;
            size_t dedicatedSystemMemory;
            size_t sharedSystemMemory;
            uint32_t luidLowPart;
            int32_t luidHighPart;
            uint32_t flags;
        } StatsBridgeAdapterDescription;

        int32_t CreateDXGIFactory1(const StatsBridgeGuid *interfaceId, void **factory);
    ]])
end

local function com_method(object, position, signature)
    return ffi.cast(signature, ffi.cast('void ***', object)[0][position])
end

local function release(object)
    com_method(object, consts.RELEASE_METHOD, 'uint32_t (*)(void *)')(object)
end

local function adapter_key(high_part, low_part)
    return string.format(consts.GPU_ADAPTER_KEY_TEMPLATE, bit.band(high_part, consts.GPU_LUID_HIGH_PART_MASK), low_part)
end

function gpu_names.read()
    define_types()

    local dxgi_loaded, dxgi = pcall(ffi.load, 'dxgi')

    if not dxgi_loaded then
        return {}
    end

    local factory = ffi.new('void *[1]')

    if dxgi.CreateDXGIFactory1(ffi.new('StatsBridgeGuid', consts.FACTORY_INTERFACE_ID), factory) ~= 0 then
        return {}
    end

    local names = {}
    local enum_adapters = com_method(factory[0], consts.ENUM_ADAPTERS1_METHOD, 'int32_t (*)(void *, uint32_t, void **)')
    local get_description = 'int32_t (*)(void *, StatsBridgeAdapterDescription *)'
    local adapter = ffi.new('void *[1]')
    local position = 0

    while enum_adapters(factory[0], position, adapter) == 0 do
        local description = ffi.new('StatsBridgeAdapterDescription')

        if com_method(adapter[0], consts.GET_DESCRIPTION1_METHOD, get_description)(adapter[0], description) == 0 then
            names[adapter_key(description.luidHighPart, description.luidLowPart)] = wide_string.to_text(description.description)
        end

        release(adapter[0])
        position = position + 1
    end

    release(factory[0])

    return names
end

return gpu_names
