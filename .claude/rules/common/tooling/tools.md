---
paths:
  - "package.json"
  - "package-lock.json"
  - "tsconfig*.json"
  - "**/tsconfig.json"
  - "eslint.config.mjs"
---

# TypeScript и eslint

- **Версии, которые держим:** eslint и `@eslint/js` - 9, пока `eslint-plugin-react` и `eslint-plugin-jsx-a11y` не поддержат 10; TypeScript - 6.0, пока `typescript-eslint` не поддержит 7 (в TypeScript 7 нет классического API компилятора).
- **`eslint.config.mjs` - только родные flat-конфиги** пакетов (`js.configs.recommended`, `react.configs.flat.recommended`, `tseslint.configs.recommendedTypeChecked`, `jsxA11y.flatConfigs.recommended`), без прослоек `FlatCompat` и `fixupPluginRules`. Правила импорта - `eslint-plugin-import-x` с префиксом `import-x/`, `@typescript-eslint/*` - из пакета `typescript-eslint`. Меняя конфиг, сверяем `npx eslint --print-config <файл>` до и после.
- **`tsconfig.json` - только диспетчер** (`files: []` и `references` на конфиги частей): VS Code ищет файл с этим именем и по ссылкам находит конфиг для любого `.ts`, иначе у `rspack/` и `scripts/` нет типов Node. Сам его никто не компилирует: `tsc` отказывается от ссылок на проекты с `noEmit` (TS6310), поэтому `lint:tsc` запускает каждый конфиг по `-p`, а knip берёт `--tsConfig` клиента (без него не видит `typings/*.d.ts`).
- **tsconfig клиента**: `moduleResolution: "bundler"` без `baseUrl`, `strict` без поблажек (вместе со `strictNullChecks`) плюс `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules` (swc компилирует по файлу), `noEmit` (`tsc` только проверяет).
  - `.d.ts` - только в корневой `typings/`. TypeScript 6 не подключает `@types/*` сам, поэтому `process.env` от Rspack описан в `typings/process.d.ts`.
  - Код сборки и скрипты (`rspack.config.ts`, `rspack/`, `scripts/`) проверяет свой tsconfig с типами Node, e2e - свой с Node и DOM вместе (функции для `addInitScript` выполняются в странице); `lint:tsc` запускает все, в клиенте типов Node нет.
- **Eslint проверяет весь репозиторий** (`lint:src` - `eslint .`) с типами из всех tsconfig (`parserOptions.project`): новый `.ts` вне исходников должен попасть в `include` одного из них, иначе хук упадёт с «file was not found in any of the provided project(s)». В `scripts/` разрешён `console`, в `e2e/` выключено `react-hooks/rules-of-hooks` (аргумент `use` фикстур Playwright - не хук React).
