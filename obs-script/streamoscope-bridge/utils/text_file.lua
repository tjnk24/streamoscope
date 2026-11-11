local ffi = require('ffi')

local consts = require('streamoscope-bridge.consts')
local wide_string = require('streamoscope-bridge.utils.wide_string')

local text_file = {}

pcall(ffi.cdef, [[
    uint32_t GetFileAttributesW(const uint16_t *path);
    void *CreateFileW(const uint16_t *path, uint32_t access, uint32_t shareMode, void *security, uint32_t disposition, uint32_t flags, void *template);
    int ReadFile(void *file, void *buffer, uint32_t bytesToRead, uint32_t *bytesRead, void *overlapped);
]])

pcall(ffi.cdef, 'int CloseHandle(void *handle);')
pcall(ffi.cdef, 'int WriteFile(void *file, const void *buffer, uint32_t bytesToWrite, uint32_t *bytesWritten, void *overlapped);')
pcall(ffi.cdef, 'int CreateDirectoryW(const uint16_t *path, void *security);')
pcall(ffi.cdef, 'int DeleteFileW(const uint16_t *path);')
pcall(ffi.cdef, 'int MoveFileExW(const uint16_t *source, const uint16_t *target, uint32_t flags);')
pcall(ffi.cdef, 'int GetFileSizeEx(void *file, int64_t *size);')

function text_file.exists(path)
    local attributes = ffi.C.GetFileAttributesW(wide_string.from_text(path))

    return attributes ~= consts.INVALID_FILE_ATTRIBUTES and bit.band(attributes, consts.FILE_ATTRIBUTE_DIRECTORY) == 0
end

function text_file.read(path)
    local file = ffi.C.CreateFileW(wide_string.from_text(path), consts.GENERIC_READ, consts.FILE_SHARE_READ_WRITE_DELETE, nil, consts.OPEN_EXISTING, 0, nil)

    if file == consts.INVALID_HANDLE_VALUE then
        return nil
    end

    local buffer = ffi.new('uint8_t[?]', consts.TEXT_FILE_MAX_READ_BYTES)
    local bytes_read = ffi.new('uint32_t[1]')
    local succeeded = ffi.C.ReadFile(file, buffer, consts.TEXT_FILE_MAX_READ_BYTES, bytes_read, nil)

    ffi.C.CloseHandle(file)

    if succeeded == 0 then
        return nil
    end

    return ffi.string(buffer, bytes_read[0])
end

function text_file.write(path, text)
    local file = ffi.C.CreateFileW(wide_string.from_text(path), consts.GENERIC_WRITE, consts.FILE_SHARE_READ_WRITE_DELETE, nil, consts.CREATE_ALWAYS, 0, nil)

    if file == consts.INVALID_HANDLE_VALUE then
        return false
    end

    local bytes_written = ffi.new('uint32_t[1]')
    local succeeded = ffi.C.WriteFile(file, text, #text, bytes_written, nil)

    ffi.C.CloseHandle(file)

    return succeeded ~= 0
end

function text_file.append(path, text)
    local file = ffi.C.CreateFileW(wide_string.from_text(path), consts.FILE_APPEND_DATA, consts.FILE_SHARE_READ_WRITE_DELETE, nil, consts.OPEN_ALWAYS, 0, nil)

    if file == consts.INVALID_HANDLE_VALUE then
        return false
    end

    local bytes_written = ffi.new('uint32_t[1]')
    local succeeded = ffi.C.WriteFile(file, text, #text, bytes_written, nil)

    ffi.C.CloseHandle(file)

    return succeeded ~= 0
end

function text_file.size(path)
    local file = ffi.C.CreateFileW(wide_string.from_text(path), consts.GENERIC_READ, consts.FILE_SHARE_READ_WRITE_DELETE, nil, consts.OPEN_EXISTING, 0, nil)

    if file == consts.INVALID_HANDLE_VALUE then
        return 0
    end

    local size = ffi.new('int64_t[1]')
    local succeeded = ffi.C.GetFileSizeEx(file, size)

    ffi.C.CloseHandle(file)

    return succeeded ~= 0 and tonumber(size[0]) or 0
end

function text_file.move(source, target)
    return ffi.C.MoveFileExW(wide_string.from_text(source), wide_string.from_text(target), consts.MOVEFILE_REPLACE_EXISTING) ~= 0
end

function text_file.replace(path, text)
    local temporary_path = path .. '.tmp'

    if text_file.write(temporary_path, text) and text_file.move(temporary_path, path) then
        return true
    end

    text_file.remove(temporary_path)

    return false
end

function text_file.remove(path)
    ffi.C.DeleteFileW(wide_string.from_text(path))
end

function text_file.ensure_directory(path)
    ffi.C.CreateDirectoryW(wide_string.from_text(path), nil)
end

return text_file
