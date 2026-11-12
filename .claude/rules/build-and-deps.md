---
paths:
  - "package.json"
  - "package-lock.json"
  - ".nvmrc"
  - "tsconfig*.json"
  - "webpack.config.ts"
  - "webpack/**"
---

# Сборка и зависимости

## TypeScript и eslint

- **Версии, которые держим:** eslint и `@eslint/js` - 9, пока `eslint-plugin-import`, `eslint-plugin-react` и `eslint-plugin-jsx-a11y` не поддержат 10; TypeScript - 6.0, пока `typescript-eslint` не поддержит 7 (в TypeScript 7 нет классического API компилятора).
- **`tsconfig.json`**: `moduleResolution: "bundler"` без `baseUrl`, `strict` без поблажек плюс `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules` (swc компилирует по файлу), `noEmit` (`tsc` только проверяет).
  - `.d.ts` - только в корневой `typings/`. TypeScript 6 не подключает `@types/*` сам, поэтому `process.env` от webpack описан в `typings/process.d.ts`.
  - Код сборки (`webpack.config.ts`, `webpack/`, `scripts/`) проверяет `tsconfig.node.json` с типами Node, `lint:tsc` запускает оба, в `src` типов Node нет.
- **Eslint проверяет весь репозиторий** (`lint:src` - `eslint .`) с типами из обоих tsconfig (`parserOptions.project`): новый `.ts` вне `src` должен попасть в `include` одного из них, иначе хук упадёт с «file was not found in any of the provided project(s)». В `scripts/` разрешён `console`.

## Webpack

- **Конфиг - на TypeScript и по частям.** `webpack.config.ts` только собирает его через `lodash/flow` из функций `webpack/init/*` и `webpack/rules/*` (реэкспорт - `webpack/index.ts`) вида `(опции) => (webpackConfig) => webpackConfig`: `initBaseConfig` (режим, `resolve`, алиасы), `initClientConfig` (вход, выход, плагины), `initDevServer`, `loadScripts` (swc), `loadStyles` (CSS-модули и sass), `loadAssets` (картинки).
  - Флаги (`IS_DEVELOPMENT`, `IS_DEV_SERVER`, `CONTENT_HASH`) - `webpack/consts.ts`; `process.env` панели - `defineGlobals`; `/dev/obs-connection` - `serveObsConnection`; журнал dev-сервера - `webpack/init/devJournal`.
  - Новая часть - новая функция в `webpack/init/` (настройки, плагины) или `webpack/rules/` (загрузчики) и строка в `flow`, а не правка чужой.
- **Node 24 запускает `.ts` сам**, импорты - с `.ts`; пакет `"type": "module"`, код сборки и скрипты - ES-модули. Поэтому lodash в `webpack.config.ts`, `webpack/` и `scripts/` - с `.js` (`lodash/flow.js`): у lodash нет `exports`, без расширения - `ERR_MODULE_NOT_FOUND`. В `src` - без расширения (`lodash/find`), его подставляет webpack.
- **Алиасы** (`__types`, `__utils` и другие) - только в `paths` у `tsconfig.json`, webpack берёт их через `tsconfig-paths-webpack-plugin`.
- **Кэш** - `cache: filesystem` в `node_modules/.cache/webpack`, у стенда своя папка (`WEBPACK_CACHE_DIRECTORY`). У каждого режима своя папка (`CACHE_NAME`): настройки swc у dev-сервера другие при тех же именах правил. Значения `DefinePlugin` кэш учитывает сам (сборка с `TEST_UPDATE_SERVER` не попадает в обычную). В CI кэша нет. Сборка странная после обновления инструментов - удаляем папку кэша.
- **Минификатор - swc через `minimizer-webpack-plugin`**, а не terser по умолчанию у webpack: swc заметно быстрее. Выдаёт синтаксис до ES2022, минимальный Chromium в `config/compatibility.json` (103) его поддерживает; поднимая `target` или меняя минификатор, сверяем с этой версией. CSS сжимает `sass` в production, минификатор его не трогает. `build` чистит `output.clean`.

## Node.js

- **Минимум - 24**: `.nvmrc` (по нему ставят Node и GitHub Actions) и `engines` в `package.json` (`^24 || >=26`: нечётную 25 исключает http-proxy-middleware из webpack-dev-server). Это наше решение: зависимостям сейчас хватает 22.22.1 (lint-staged, react-router), ниже 24 не опускаем. Меняем - в `.nvmrc`, `engines`, README и `docs/DEVELOPMENT.md`.
- **После каждого `npm install`/`npm update`, который меняет `package-lock.json`**, проверяем `engines.node` всех пакетов в нём (и вложенных, и dev): самая высокая нижняя граница и исключённые ветки.
  - Строже нашего `engines` (выше 24 или исключает нашу ветку) - в том же изменении поднимаем минимум в `engines`, `.nvmrc`, README и `docs/DEVELOPMENT.md`, в пункте выше пишем, какой пакет его задаёт, и проверяем на новой минимальной версии из `nvm` (её `node.exe` напрямую, без `nvm use`): `npm run build:prod`, `npm run package:release`, `npm run lint`, dev-сервер.
  - Пакет перестал поддерживать и 24 - сначала обсуждаем с пользователем: откатить пакет или перейти на новую ветку Node.
  - Что нашли и подняли ли минимум - пишем в ответе.
