---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript: типы, утилиты, константы, оформление

## Типы

- **Общие типы и енумы - `src/types/`**, импорт `__types/<путь>`, внутри `src/types` - относительно (`./views`, `../i18n/language`).
  - Несколько типов в одном файле - если у них общий смысл и назначение (`obs/responses.ts` - все ответы obs-websocket, `app/settings.ts` - настройки и миграции). Файл называем по смыслу с маленькой буквы, зависимый тип - после того, от которого зависит.
  - Типу не с кем объединиться - лежит один, имя файла = имя типа (`CopyResultEnum.ts`). Объединяем по назначению, а не по соседству: `ConnectionStatusEnum`, `DevObsConnectionDto`, `Sha256ConstantsDto` - про соединение, но служат разному, поэтому отдельно.
  - `ObsRequestTypeEnum` - всегда один в файле: `scripts/packageRelease` читает файл как текст и берёт список запросов.
  - Области - по назначению кода (`obs`, `bridge.ts`, `journal.ts`, `targets.ts`, `stats`, `connection`, `i18n`, `app`, `mock.ts`, `update`, `api`); неочевидные файлы: `app/slices` - внедрённые слайсы страницы и их экшены, `update/bridgeUpdate` - статус от моста, `api/request` - слайс запроса и экшены лоадера. Так же устроены `scripts/testStand/types` и `webpack/types.ts`.
  - Типы общих функций и классов (`src/utils`, `src/services`) в их файлах не объявляем. Типы одной страницы или контейнера - в их `types.ts`.
- **Отсутствие значения - `Nullable<Value>`** (`infrastructure/common`), а не `?:` у обязательного пропа.
- **Параметры типов - по смыслу, не одной буквой**: `Nullable<Value>`, `findResultData<ResultData>`, `preload<WrappedProps>`, `ObsRequestResultDto<ResponseData>`.
- **Вложенных типов нет**: у поля, параметра, дженерика или приведения не пишем тип-объект на месте (`outputs: {name: string}[]`, `Nullable<{time: number}>`, `({context}: {context: string})`). Каждый объект - именованный тип (`BridgeOutputDto`, `OutputBytesSampleDto`), и в `typings/*.d.ts` (`WebpackProcessEnv`), и в `webpack/types.ts`.

## Утилиты и константы

- **Утилита - в `utils/`, одна экспортируемая функция на файл**, имя файла = имя функции. Утилита считает данные (`formatPercent`, `getBridgeScriptPath`, `drawGraph` рисует на canvas), JSX не возвращает. Функция, которая возвращает разметку (`renderLabel`), - не утилита: нужна одному месту - разметка прямо там (подпись строки - в `items.map` у `StatList`), нескольким или держит хуки - компонент.
- **Внутренних хелперов в файле утилиты, класса или компонента нет**: каждая функция уровня модуля - в своём файле. Хелперы одной утилиты или класса - в её папке, `index.ts` реэкспортирует главную функцию, импорт снаружи не меняется (`utils/stats/StatsTracker/{StatsTracker.ts, createOutputState.ts, isStatusRequestOf.ts, index.ts}`). Хелперы компонента - в его `utils/`.
- **Утилиты одного назначения - в `utils/<назначение>/`** (в `src/utils`: `requests` - батчи obs-websocket, `targets`, `stats`, `auth`, `bridge`, `mock`, `settings`, `update`, `journal`, `redux`, `api` - основа слоя API, а транспорты и API-классы сервисов - в `src/api`). Внутри папки импорт относительный (`./`), снаружи - `__utils/<папка>/<файл>`.
- **Константа уровня модуля - не рядом с функцией** (`const UPDATE_STAGES = [...]`, `RegExp`, код ответа, путь), а в ближайшем существующем `consts.ts` вверх по дереву:
  - `src/utils/**` и сервисы - `src/utils/consts.ts`; `webpack/**` - `webpack/consts.ts`; страница - её `consts.ts`; `src/api` - `consts.ts` в папке транспорта (`api/github/transport/consts.ts`: базовый адрес и заголовки). Эндпоинты - не в `consts.ts`, а в `src/routes/api/<api>.ts` (решение пользователя).
  - Новый `consts.ts` не заводим, если выше есть подходящий; свои - только у мест с большим набором данных (`utils/mock/MockObsSimulator`, `scripts/*`, `tests/consts.ts`).
  - Исключения: `initialState` слайса (в файле слайса), файлы-данные без функций (словари `i18n/locales`, роуты в `src/routes/`, массивы роутов, `theme.ts`), созданные объекты (экземпляры сервисов, `store`, `router`).
- **Тип объявляем только у констант-объектов и массивов объектов** (`DEFAULT_SETTINGS: SettingsDto`, `PLATFORM_RULES: PlatformRuleDto[]`, `Record<...>`), ключи одинаковых словарей - енумы. Числа, строки, `RegExp`, массивы простых значений - без типа (`RECONNECT_INTERVAL_MS = 3000`), кроме случаев, когда вывод TypeScript не подходит: кортеж для antd (`PROGRESS_SIZE: [number, number]`), `string[]` из `Object.values` енума для сверки со строкой (`UPDATE_STAGES`), `Nullable<...>` с начальным `null`.

## Оформление

- **Поля класса разделяем пустой строкой**, как методы.
- **Импорт от трёх объектов - в столбик** (eslint `streamoscope/import-column`, `--fix` расставит сам).
- **Деструктуризация до 4 полей - в строку, от 5 - столбиком** по полю на строку: пропсы, енумы, внутри функций (`const {Ok, Warn, Bad, Off} = HealthLevelEnum;`). Eslint (`object-curly-newline` для `ObjectPattern`: `minProperties: 5`, `consistent: false`) переносит только скобки, поля расставляем руками. Объект-литерал - тот же порог, даже со всеми сокращёнными полями (`return {version, minObsVersion, ...}` из шести полей - столбиком); это eslint не ловит.
- **Тернарник в строку - только короткий и одноуровневый** (`type={isClosed ? 'error' : 'info'}`, строка заметно короче лимита).
  - Вложенный - столбиком: условие, `? ветка`, `: ветка` на своих строках, вложенный - с ещё одним отступом (`strokeColor` в `CongestionProgress`, `value` в `OutputCard`). Длинный одноуровневый (вызовы с аргументами, шаблонные строки) - тоже столбиком.
  - Тернарник удлиняет атрибут JSX, вызов `t()` или шаблонную строку - выносим в константу выше (`message`, `errorKey`, `memoryText`, `mainKbps`); если константу не завести (аргумент в `case`), аргументы вызова - столбиком.
- **Многострочное выражение аргументом вызова не пишем** (решение пользователя: нечитаемо). Цепочку (`.map(...).filter(...)`), вычисление на несколько строк или собранный объект - сначала в константу с понятным именем, отделённую пустой строкой, а вызов получает её (`discoverTargets`): `const pluginOutputNames = outputs.filter(...).map(...);` (цепочка - столбиком), затем `countBy(pluginOutputNames)`; `const sameNameNote: NoteDto = {...}`, затем `notes.push(sameNameNote)`. Короткий однострочный аргумент (`releaseNotesLoader({per_page: 30})`) - на месте.
  - Так же в скриптах и сборке: опции `new HtmlWebpackPlugin({...})` или правило загрузчика - в константу (`htmlPlugin`, `styleRule`), затем `webpackConfig.plugins?.push(htmlPlugin)`; сообщение - в константу, затем `socket.send(JSON.stringify(identifyMessage))`.
  - Исключение - вызовы, которые сами и есть описание: `createSlice({...})`, `configureStore({...})`, `ky.create`/`extend`, `injectSlices({...})`, `i18n.init({...})`, `defineConfig({...})`, `Object.assign(webpackConfig, {...})` и `flow([...])` в webpack, фабрика `vi.mock(..., () => ({...}))`, таблица `it.each([...])`: объект прямо в вызове, по строкам.
- **Члены енума не пишем через точку раз за разом**: после импортов енум деструктурируется (`const {Preparing, Downloading} = UpdateStageEnum;`), дальше коротко (`[Preparing]: ...`, `stage === Done`). Для любого файла, где члены одного енума встречаются больше раза: словари в `consts.ts` (`ANTD_LOCALES`, `UPDATE_STAGE_TEXTS`), ресурсы i18n, компоненты, сервисы, утилиты, `case` в `switch`. Единственное упоминание - через точку. Короткое имя уже занято другим енумом в файле (`Identified` в `ObsOpCodeEnum` и `ConnectionStatusEnum` в `obsConnectionService`) - второй енум через точку.
