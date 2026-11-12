---
paths:
  - "obs-script/**"
---

# Скрипт-мост (Lua)

Как устроены загрузчик, автооткат и команды - `docs/internals/bridge.md`, читаем перед правкой этих частей. Проверка - `npm run test:bridge`.

- **`streamoscope-bridge/main.lua` - только точка входа**: подключает модули и отвечает OBS (`script_description`, `script_load`, `script_unload`, события фронтенда), логики в нём нет.
- **Модули - в `obs-script/streamoscope-bridge/`**, подключаются `require('streamoscope-bridge.<модуль>')`. Префикс обязателен: загрузчик ищет только такие имена, а `require('json')` нашёл бы чужой файл.
- **Источник с состоянием - класс, без состояния - модуль.**
  - Класс (`Gpu`, `StreamOutputs`): таблица с `Class.__index = Class`, конструктор `Class.new()` возвращает `setmetatable({...}, Class)`, открытые методы - `function Class:method()`, состояние - поля `self`. Приватные помощники - `local function helper(self, ...)` в его файле (методы с `_` снаружи видно).
  - Конструктор не падает, если источник недоступен (не Windows, нет DLL): объект создаётся, `sample`/`read` возвращают `nil`.
  - Экземпляры создаёт `script_load` (`open_sources`), закрывают `script_unload` и выключение скриптов (`close_sources`), в `publisher` они приходят параметром `sources`.
  - Модуль - таблица функций (`targets.read`, `json.encode`), его `local`-функции и константы приватные.
  - Файл - snake_case, переменная класса при подключении - PascalCase (`local Gpu = require(...)`), модуля - snake_case.
- **Константы - только в `consts.lua`** (корень `streamoscope-bridge/`, один на мост), обращение `consts.ИМЯ`: числа WinAPI, шаблоны, пути счётчиков, GUID. Непонятное без контекста имя - с префиксом модуля (`JSON_ARRAY_METATABLE`, `TEXT_FILE_MAX_READ_BYTES`). Таблица модуля (`local gpu_names = {}`), класс и `__index` - не константы. Исключения - загрузчик `obs-script/streamoscope-bridge.lua` и заглушка `installer/loader/streamoscope-bridge.lua`: выбирают версию раньше любого модуля, поэтому свои константы (`TRIAL_*`, `CURRENT_VERSION_*`, числа WinAPI) и FFI держат в начале файла.
- **`error()` в OBS ничего не бросает** - только пишет в журнал скриптов. Остановить загрузку файла - `error(сообщение, 0)` и сразу `return false`; ошибку для `pcall` бросает сама Lua (`assert`), а не `error`. Подробности - `docs/internals/bridge.md`.
- **`obslua` - через `local obs = obslua`** в каждом модуле, которому он нужен; глобальных переменных не заводим. `ffi.cdef` - в модуле, который его использует, в `pcall`: повторное объявление типа - ошибка.
- **Пути и переменные окружения - только W-функции Windows** (`environment.get`, `text_file`, `process.start_hidden`, строки через `wide_string`): `os.getenv`, `io.open`, `os.execute` работают в ANSI и ломаются на кириллице в имени пользователя, `os.execute` ещё и мелькает консолью.
- **JSON не склеиваем строками**: таблица и `json.encode`. Пустой массив - `json.array({})` (иначе `{}`), явный `null` - `json.null`, поле с `nil` в JSON не попадает.
- **Ошибка одного источника не роняет скрипт**: создание источников в `script_load` и каждое чтение в `publisher` - в `pcall`, без данных поле пропадает.
- **Имена - snake_case**, остальные правила имён и «никаких комментариев» - как для TS.
