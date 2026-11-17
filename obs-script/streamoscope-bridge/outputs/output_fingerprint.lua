local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local OutputFingerprint = {}

OutputFingerprint.__index = OutputFingerprint

local function define_types()
    pcall(ffi.cdef, [[
        int32_t BCryptOpenAlgorithmProvider(void **algorithm, const uint16_t *algorithmId, const uint16_t *implementation, uint32_t flags);
        int32_t BCryptCloseAlgorithmProvider(void *algorithm, uint32_t flags);
        int32_t BCryptCreateHash(void *algorithm, void **hash, uint8_t *hashObject, uint32_t hashObjectLength, const char *secret, uint32_t secretLength, uint32_t flags);
        int32_t BCryptHashData(void *hash, const char *input, uint32_t inputLength, uint32_t flags);
        int32_t BCryptFinishHash(void *hash, uint8_t *output, uint32_t outputLength, uint32_t flags);
        int32_t BCryptDestroyHash(void *hash);
        int32_t RegGetValueW(void *key, const uint16_t *subKey, const uint16_t *value, uint32_t flags, uint32_t *type, void *data, uint32_t *dataLength);
    ]])
    pcall(ffi.cdef, 'size_t strlen(const char *text);')
end

local function read_machine_guid()
    local advapi = ffi.load('advapi32')
    local buffer = ffi.new('uint16_t[?]', consts.MACHINE_GUID_MAX_CHARACTERS)
    local buffer_bytes = ffi.new('uint32_t[1]', consts.MACHINE_GUID_MAX_CHARACTERS * ffi.sizeof('uint16_t'))
    local sub_key = wide_string.from_text(consts.MACHINE_GUID_KEY)
    local value_name = wide_string.from_text(consts.MACHINE_GUID_VALUE)
    local flags = consts.RRF_RT_REG_SZ + consts.RRF_SUBKEY_WOW6464KEY

    if advapi.RegGetValueW(consts.HKEY_LOCAL_MACHINE, sub_key, value_name, flags, nil, buffer, buffer_bytes) ~= 0 then
        return ''
    end

    return wide_string.to_text(buffer)
end

local function measure_part(part)
    if type(part) == 'string' then
        return #part
    end

    return tonumber(ffi.C.strlen(part))
end

local function hash_parts(self, hash, parts)
    local separator = consts.OUTPUT_FINGERPRINT_SEPARATOR

    for _index, part in ipairs(parts) do
        if self.bcrypt.BCryptHashData(hash, part, measure_part(part), 0) ~= 0 then
            return false
        end

        if self.bcrypt.BCryptHashData(hash, separator, #separator, 0) ~= 0 then
            return false
        end
    end

    return true
end

local function format_digest(digest)
    local hex_bytes = {}

    for byte_index = 0, consts.OUTPUT_FINGERPRINT_BYTES - 1 do
        hex_bytes[#hex_bytes + 1] = string.format(consts.OUTPUT_FINGERPRINT_BYTE_TEMPLATE, digest[byte_index])
    end

    return table.concat(hex_bytes)
end

function OutputFingerprint.new()
    local self = setmetatable({}, OutputFingerprint)

    define_types()

    local bcrypt_loaded, bcrypt = pcall(ffi.load, 'bcrypt')

    if not bcrypt_loaded then
        return self
    end

    local algorithm = ffi.new('void *[1]')
    local algorithm_name = wide_string.from_text(consts.BCRYPT_SHA256_ALGORITHM)

    if bcrypt.BCryptOpenAlgorithmProvider(algorithm, algorithm_name, nil, consts.BCRYPT_ALG_HANDLE_HMAC_FLAG) ~= 0 then
        return self
    end

    local guid_read, machine_guid = pcall(read_machine_guid)

    self.bcrypt = bcrypt
    self.algorithm = algorithm[0]
    self.secret = consts.OUTPUT_FINGERPRINT_SALT .. (guid_read and machine_guid or '')

    return self
end

function OutputFingerprint:compute(parts)
    if self.algorithm == nil then
        return nil
    end

    local hash = ffi.new('void *[1]')

    if self.bcrypt.BCryptCreateHash(self.algorithm, hash, nil, 0, self.secret, #self.secret, 0) ~= 0 then
        return nil
    end

    local digest = ffi.new('uint8_t[?]', consts.SHA256_DIGEST_BYTES)
    local is_finished = hash_parts(self, hash[0], parts) and self.bcrypt.BCryptFinishHash(hash[0], digest, consts.SHA256_DIGEST_BYTES, 0) == 0

    self.bcrypt.BCryptDestroyHash(hash[0])

    return is_finished and format_digest(digest) or nil
end

function OutputFingerprint:compute_key(key, token)
    if measure_part(key) == 0 and measure_part(token) == 0 then
        return nil
    end

    return self:compute({key, token})
end

function OutputFingerprint:close()
    if self.algorithm ~= nil then
        self.bcrypt.BCryptCloseAlgorithmProvider(self.algorithm, 0)
    end

    self.algorithm = nil
end

return OutputFingerprint
