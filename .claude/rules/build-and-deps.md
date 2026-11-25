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

# Сборка и зависимости, своё

Общее - `.claude/rules/common/tooling/{tools,rspack,node}.md`.

- **Tsconfig трёх частей**: клиент - `tsconfig.app.json` (`src` и `typings`), сборка и скрипты - `tsconfig.node.json`, e2e и `playwright.config.ts` - `e2e/tsconfig.json`.
- **Кэш Rspack**: у стенда своя папка (`RSPACK_CACHE_DIRECTORY`), сборка с `TEST_UPDATE_SERVER` в обычную не попадает.
- **Минификатор** выдаёт синтаксис до ES2022, минимальный Chromium в `config/compatibility.json` (103) его поддерживает.
- **Минимум Node**: зависимостям сейчас хватает 22.22.1 (lint-staged, react-router). Пишем его ещё и в `docs/DEVELOPMENT.md`, проверяем через `npm run build:prod`, `npm run package:release`, `npm run lint` и dev-сервер.
- **`--engine-strict`** - и в `ci.yml`, и в `release.yml`.
- **Dependabot rules**: два правила скрывают уязвимости `devDependency` и открывают PR на уязвимость high или critical в пакете сборки (npm, `runtime`, вместе с вложенными).
