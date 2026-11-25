---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript: своё

Общее - `.claude/rules/common/code/typescript.md`.

- **Типы в `src/types`**: области - `obs`, `bridge.ts`, `journal.ts`, `targets.ts`, `stats`, `connection`, `i18n`, `app`, `mock.ts`, `update`, `api`; неочевидный файл - `update/bridgeUpdate`: статус от моста. Свои типы и у стенда - `scripts/testStand/types`.
  - Образцы: вместе - `obs/responses.ts` (все ответы obs-websocket), `app/settings.ts` (настройки и миграции); отдельно - `ConnectionStatusEnum`, `DevObsConnectionDto`, `Sha256ConstantsDto` (про соединение, но служат разному).
  - `ObsRequestTypeEnum` - всегда один в файле: `scripts/packageRelease` читает файл как текст и берёт список запросов.
- **Папки `src/utils`**: `requests` - батчи obs-websocket, `targets`, `stats`, `auth`, `bridge`, `mock`, `settings`, `update`, `journal` и общие `redux`, `hocs`, `dev`, `api`. Образец утилиты с хелперами - `utils/stats/StatsTracker`.
- **Свой `consts.ts`** - ещё у `utils/mock/MockObsSimulator`; у транспорта - `api/github/transport/consts.ts`.
- **Правило eslint импорта в столбик** - `streamoscope/import-column`.
- **Образцы оформления**: вложенный тернарник - `strokeColor` в `CongestionProgress`, `value` в `OutputCard`; вынесенное из вызова - `discoverTargets`; занятое имя члена енума - `Identified` в `ObsOpCodeEnum` и `ConnectionStatusEnum` (`obsConnectionService`).
