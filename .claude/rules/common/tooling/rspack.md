---
paths:
  - "package.json"
  - "tsconfig*.json"
  - "rspack.config.ts"
  - "rspack/**"
---

# Rspack

- **Конфиг - на TypeScript и по частям.** `rspack.config.ts` только собирает его через `lodash/flow` из функций `rspack/init/*` и `rspack/rules/*` (реэкспорт - `rspack/index.ts`) вида `(опции) => (rspackConfig) => rspackConfig`: `initBaseConfig` (режим, кэш, `resolve`, алиасы), `initClientConfig` (вход, выход, плагины), `initDevServer`, `loadScripts` (swc), `loadStyles` (CSS-модули и sass), `loadAssets` (картинки и шрифты). CLI Rspack находит `rspack.config.ts` сам и грузит его через Node (`--config-loader auto`).
  - Флаги (`IS_DEVELOPMENT`, `IS_DEV_SERVER`, `CONTENT_HASH`) - `rspack/consts.ts`; `process.env` клиента - `defineGlobals`; эндпоинты dev-сервера, если есть, - `rspack/init/devServer`.
  - Новая часть - новая функция в `rspack/init/` (настройки, плагины) или `rspack/rules/` (загрузчики) и строка в `flow`, а не правка чужой.
- **Плагины и загрузчики - встроенные в Rspack**, где они есть: `builtin:swc-loader`, `HtmlRspackPlugin`, `CssExtractRspackPlugin`, `SwcJsMinimizerRspackPlugin`, `DefinePlugin`, алиасы - `resolve.tsConfig`. Отдельными пакетами - `@rspack/plugin-react-refresh` (dev-сервер), `ts-checker-rspack-plugin` (dev), `eslint-rspack-plugin` (`build:dev`, ошибки eslint - предупреждениями), стили - `css-loader` и `sass-loader`, в dev - `style-loader`. Встроенные CSS-модули Rspack (`type: 'css/module'`) не берём: другие имена классов и порядок CSS.
- **`IS_DEV_SERVER` - из `RSPACK_SERVE` в `process.env`**, его задаёт скрипт `start:dev`: CLI Rspack кладёт `RSPACK_SERVE` только в аргумент `env` конфига-функции, а не в `process.env`.
- **Dev-сервер (`@rspack/dev-server`) - на connect, не на express**: свои обработчики, если есть, получают голые `IncomingMessage`/`ServerResponse` (статус - `endWithStatus`), маршруты - `createDevRoute` в `setupMiddlewares` с точной проверкой метода и пути (у connect путь совпадает по префиксу), ставим их перед остальными.
- **Node 24 запускает `.ts` сам**, импорты - с `.ts`; пакет `"type": "module"`, код сборки и скрипты - ES-модули. Поэтому lodash в `rspack.config.ts`, `rspack/` и `scripts/` - с `.js` (`lodash/flow.js`): у lodash нет `exports`, без расширения - `ERR_MODULE_NOT_FOUND`. В клиенте - без расширения (`lodash/find`), его подставляет Rspack.
- **Алиасы** (`__types`, `__utils` и другие) - только в `paths` у tsconfig клиента, Rspack берёт их через `resolve.tsConfig`, vitest - в `vitest.config.ts`.
- **Кэш** - `cache: {type: 'persistent'}` в `node_modules/.cache/rspack`. У каждого режима своя папка (`CACHE_NAME`): настройки swc у dev-сервера другие при тех же именах правил. Значения `DefinePlugin` кэш учитывает сам. В CI кэша нет. Сборка странная после обновления инструментов - удаляем папку кэша.
- **Минификатор - `SwcJsMinimizerRspackPlugin`**. Поднимая `target` или меняя минификатор, сверяем с минимальным браузером проекта. Лицензии уходят в `.LICENSE.txt` по `LICENSE_COMMENT_PATTERN` (`/*!`, `@license`, `@preserve`): условие по умолчанию тащит туда и doc-комментарии иконок antd (`/**![api](data:...)`). CSS сжимает `sass` в production, CSS-минификатор Rspack по умолчанию не подключаем (`optimization.minimizer` задан явно). `build` чистит `output.clean`.
