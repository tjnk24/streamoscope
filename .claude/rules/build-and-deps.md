---
paths:
  - "package.json"
  - "package-lock.json"
  - ".nvmrc"
  - "tsconfig*.json"
  - "rspack.config.ts"
  - "rspack/**"
  - "eslint.config.mjs"
---

# Сборка и зависимости

## TypeScript и eslint

- **Версии, которые держим:** eslint и `@eslint/js` - 9, пока `eslint-plugin-react` и `eslint-plugin-jsx-a11y` не поддержат 10; TypeScript - 6.0, пока `typescript-eslint` не поддержит 7 (в TypeScript 7 нет классического API компилятора).
- **`eslint.config.mjs` - только родные flat-конфиги** пакетов (`js.configs.recommended`, `react.configs.flat.recommended`, `tseslint.configs.recommendedTypeChecked`, `jsxA11y.flatConfigs.recommended`), без прослоек `FlatCompat` и `fixupPluginRules`. Правила импорта - `eslint-plugin-import-x` с префиксом `import-x/`, `@typescript-eslint/*` - из пакета `typescript-eslint`. Меняя конфиг, сверяем `npx eslint --print-config <файл>` до и после.
- **`tsconfig.json`**: `moduleResolution: "bundler"` без `baseUrl`, `strict` без поблажек плюс `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules` (swc компилирует по файлу), `noEmit` (`tsc` только проверяет).
  - `.d.ts` - только в корневой `typings/`. TypeScript 6 не подключает `@types/*` сам, поэтому `process.env` от Rspack описан в `typings/process.d.ts`.
  - Код сборки (`rspack.config.ts`, `rspack/`, `scripts/`) проверяет `tsconfig.node.json` с типами Node, e2e (`e2e/`, `playwright.config.ts`) - `e2e/tsconfig.json` с Node и DOM вместе (функции для `addInitScript` выполняются в странице) и алиасом `__e2e/*`; `lint:tsc` запускает все три, в `src` типов Node нет.
- **Eslint проверяет весь репозиторий** (`lint:src` - `eslint .`) с типами из всех трёх tsconfig (`parserOptions.project`): новый `.ts` вне `src` должен попасть в `include` одного из них, иначе хук упадёт с «file was not found in any of the provided project(s)». В `scripts/` разрешён `console`, в `e2e/` выключено `react-hooks/rules-of-hooks` (аргумент `use` фикстур Playwright - не хук React).

## Rspack

- **Конфиг - на TypeScript и по частям.** `rspack.config.ts` только собирает его через `lodash/flow` из функций `rspack/init/*` и `rspack/rules/*` (реэкспорт - `rspack/index.ts`) вида `(опции) => (rspackConfig) => rspackConfig`: `initBaseConfig` (режим, кэш, `resolve`, алиасы), `initClientConfig` (вход, выход, плагины), `initDevServer`, `loadScripts` (swc), `loadStyles` (CSS-модули и sass), `loadAssets` (картинки и шрифты). CLI Rspack находит `rspack.config.ts` сам и грузит его через Node (`--config-loader auto`).
  - Флаги (`IS_DEVELOPMENT`, `IS_DEV_SERVER`, `CONTENT_HASH`) - `rspack/consts.ts`; `process.env` панели - `defineGlobals`; эндпоинты dev-сервера - `rspack/init/devServer`.
  - Новая часть - новая функция в `rspack/init/` (настройки, плагины) или `rspack/rules/` (загрузчики) и строка в `flow`, а не правка чужой.
- **Плагины и загрузчики - встроенные в Rspack**, где они есть: `builtin:swc-loader`, `HtmlRspackPlugin`, `CssExtractRspackPlugin`, `SwcJsMinimizerRspackPlugin`, `DefinePlugin`, алиасы - `resolve.tsConfig`. Отдельными пакетами - `@rspack/plugin-react-refresh` (dev-сервер), `ts-checker-rspack-plugin` (dev), `eslint-rspack-plugin` (`build:dev`, ошибки eslint - предупреждениями), стили - `css-loader` и `sass-loader`, в dev - `style-loader`. Встроенные CSS-модули Rspack (`type: 'css/module'`) не берём: другие имена классов и порядок CSS.
- **`IS_DEV_SERVER` - из `RSPACK_SERVE` в `process.env`**, его задаёт скрипт `start:dev`: CLI Rspack кладёт `RSPACK_SERVE` только в аргумент `env` конфига-функции, а не в `process.env`.
- **Dev-сервер (`@rspack/dev-server`) - на connect, не на express**: обработчики получают голые `IncomingMessage`/`ServerResponse` (статус - `endWithStatus`), маршруты - `createDevRoute` в `setupMiddlewares` с точной проверкой метода и пути (у connect путь совпадает по префиксу), ставим их перед остальными.
- **Node 24 запускает `.ts` сам**, импорты - с `.ts`; пакет `"type": "module"`, код сборки и скрипты - ES-модули. Поэтому lodash в `rspack.config.ts`, `rspack/` и `scripts/` - с `.js` (`lodash/flow.js`): у lodash нет `exports`, без расширения - `ERR_MODULE_NOT_FOUND`. В `src` - без расширения (`lodash/find`), его подставляет Rspack.
- **Алиасы** (`__types`, `__utils` и другие) - только в `paths` у `tsconfig.json`, Rspack берёт их через `resolve.tsConfig`.
- **Кэш** - `cache: {type: 'persistent'}` в `node_modules/.cache/rspack`, у стенда своя папка (`RSPACK_CACHE_DIRECTORY`). У каждого режима своя папка (`CACHE_NAME`): настройки swc у dev-сервера другие при тех же именах правил. Значения `DefinePlugin` кэш учитывает сам (сборка с `TEST_UPDATE_SERVER` не попадает в обычную). В CI кэша нет. Сборка странная после обновления инструментов - удаляем папку кэша.
- **Минификатор - `SwcJsMinimizerRspackPlugin`**. Выдаёт синтаксис до ES2022, минимальный Chromium в `config/compatibility.json` (103) его поддерживает; поднимая `target` или меняя минификатор, сверяем с этой версией. Лицензии уходят в `.LICENSE.txt` по `LICENSE_COMMENT_PATTERN` (`/*!`, `@license`, `@preserve`): условие по умолчанию тащит туда и doc-комментарии иконок antd (`/**![api](data:...)`). CSS сжимает `sass` в production, CSS-минификатор Rspack по умолчанию не подключаем (`optimization.minimizer` задан явно). `build` чистит `output.clean`.

## Node.js

- **Минимум - 24**: `.nvmrc` (по нему ставят Node и GitHub Actions) и `engines` в `package.json` (`^24 || >=26`: нечётную 25 исключает vitest). Это наше решение: зависимостям сейчас хватает 22.22.1 (lint-staged, react-router), ниже 24 не опускаем. Меняем - в `.nvmrc`, `engines` и `docs/DEVELOPMENT.md`.
- **После каждого `npm install`/`npm update`, который меняет `package-lock.json`**, проверяем `engines.node` всех пакетов в нём (и вложенных, и dev): самая высокая нижняя граница и исключённые ветки.
  - Строже нашего `engines` (выше 24 или исключает нашу ветку) - в том же изменении поднимаем минимум в `engines`, `.nvmrc` и `docs/DEVELOPMENT.md`, в пункте выше пишем, какой пакет его задаёт, и проверяем на новой минимальной версии из `nvm` (её `node.exe` напрямую, без `nvm use`): `npm run build:prod`, `npm run package:release`, `npm run lint`, dev-сервер.
  - Пакет перестал поддерживать и 24 - сначала обсуждаем с пользователем: откатить пакет или перейти на новую ветку Node.
  - Что нашли и подняли ли минимум - пишем в ответе.
- **CI ставит пакеты через `npm ci --engine-strict`** (`ci.yml` и `release.yml`): пакет, которому не подходит Node из `.nvmrc`, роняет сборку, а не тихо ставится. Нижние границы внутри 24 (`>=24.5`) так не ловятся, поэтому проверка из пункта выше остаётся.
- **Версии обновляет пользователь руками, примерно раз в год пачкой** (решение пользователя), React - тоже. Dependabot только следит за уязвимостями, всё - в настройках репозитория: Dependabot alerts включены, Dependabot security updates выключены, два правила Dependabot rules скрывают уязвимости `devDependency` и открывают PR на уязвимость high или critical в пакете сборки (npm, `runtime`, вместе с вложенными). Файла `.github/dependabot.yml` нет и без решения пользователя не добавляем: его настройки влияют и на PR по уязвимостям.
