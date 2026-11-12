---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.Tests.ps1"
---

# Тесты

Какими командами что проверять - `docs/internals/testing.md`.

- **Модульные тесты логики панели - vitest, `npm run test:unit`** (входит в `npm test`, а значит и в CI). Тесты лежат в папке `tests/` рядом с кодом, который проверяют: `utils/settings/migrateSettings.ts` -> `utils/settings/tests/migrateSettings.test.ts`, код импортируется из `../`. Именованные тестовые данные (объекты, массивы, строки вроде `COMPATIBILITY`, `GITHUB_RELEASE`, `MIGRATIONS`) - в `tests/consts.ts` той же папки, общие для всех её тестов; помощников-функций в тестах нет, вариант данных - `{...GITHUB_RELEASE, body}` прямо в тесте. Таблицы `it.each` остаются в тесте. Импорты из `vitest` явные (`describe`, `it`, `expect`), без глобальных. Алиасы vitest берёт из `paths` в `tsconfig.json` (`vitest.config.ts`), отдельного списка нет. Тестами покрываем чистую логику, от которой зависит что-то необратимое или чужое: миграции настроек, сравнение версий, разбор ответа GitHub, проверку совместимости. Новая такая утилита - сразу с тестом.
- **Тесты - Pester 5+, `npm run test:installer`** (`installer/tests/run-tests.ps1`): `ConfigureObs.Tests.ps1` - чистые функции правки текста, `Invoke-ConfigureObs.Tests.ps1` - установка, повторная установка и удаление на образцах `installer/tests/fixtures/obs-28`, `obs-30`, `obs-33` (копируются в `TestDrive`, `__ROOT__` в `[Locations]` подменяется на путь копии), данные моста в профилях, проверка `-Mode Check`, плюс запущенный OBS, отсутствие настроек, битая коллекция, сбой записи с откатом, portable и кириллица в путях, стирание данных (`-Mode RemoveData`) и запуск `configure-obs.ps1` из папки версии отдельным процессом (там `Mock` не действует, поэтому установка и удаление этим путём пропускаются, пока открыт OBS). `Test-ObsRunning` в тестах подменяется через `Mock`. Функций-помощников в файлах `*.Tests.ps1` нет: каждая - свой файл `Глагол-Существительное.ps1` в `installer/tests/helpers/` (`configure/` для `Invoke-ConfigureObs.Tests.ps1`, `updater/packaging/` и `updater/run/` (не `release/`: такие папки скрывает `.gitignore`) для `Update-Widget.Tests.ps1`), как в `obs-script/tests/helpers`; тест подключает их в `BeforeAll`. Образцы - выдуманные данные с настоящей структурой, личных путей и паролей в них нет; `.gitattributes` держит их байты как есть (`-text`). Новый случай в формате OBS - сначала образец и тест, потом правка скрипта. Только синтаксис, который есть и в Pester 5, и в 6: в GitHub Actions на Windows стоит пятый.
