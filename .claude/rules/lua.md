---
paths:
  - "obs-script/**"
---

# Скрипт-мост (Lua), своё

Общее - `.claude/rules/common/code/lua.md`. Как устроены загрузчик, автооткат и команды - `docs/internals/bridge.md`, читаем перед правкой этих частей. Проверка - `npm run test:bridge`.

- **Точка входа `streamoscope-bridge/main.lua`** отвечает OBS: `script_description`, `script_load`, `script_unload`, события фронтенда.
- **Модули - в `obs-script/streamoscope-bridge/`**, подключаются `require('streamoscope-bridge.<модуль>')`. Префикс обязателен: загрузчик ищет только такие имена.
- **Источники** (классы, как `Gpu`, `StreamOutputs`) создаёт `script_load` (`open_sources`), закрывают `script_unload` и выключение скриптов (`close_sources`), в `publisher` они приходят параметром `sources`. `pcall` - вокруг создания в `script_load` и каждого чтения в `publisher`.
- **Константы - `streamoscope-bridge/consts.lua`.** Исключения - загрузчик `obs-script/streamoscope-bridge.lua` и заглушка `installer/loader/streamoscope-bridge.lua`: выбирают версию раньше любого модуля, поэтому свои константы (`TRIAL_*`, `CURRENT_VERSION_*`, числа WinAPI) и FFI держат в начале файла.
- **Об `error()` в OBS подробно** - `docs/internals/bridge.md`.
- **W-функции Windows** - `environment.get`, `text_file`, `process.start_hidden`, строки через `wide_string`.
- **JSON**: пустой массив - `json.array({})`, явный `null` - `json.null`.
