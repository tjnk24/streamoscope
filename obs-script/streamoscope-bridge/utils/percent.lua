local consts = require('streamoscope-bridge.consts')

local percent = {}

function percent.round(value)
    return math.floor(math.min(value, consts.MAX_PERCENT) * 10 + 0.5) / 10
end

return percent
