---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.Tests.ps1"
---

# Тесты

Какими командами что проверять - `docs/internals/testing.md`.

## Панель (vitest, `npm run test:unit`)

- Входит в `npm test`, а значит и в CI. Тесты - в `tests/` рядом с кодом: `utils/settings/migrateSettings.ts` -> `utils/settings/tests/migrateSettings.test.ts`, импорт из `../`.
- Именованные тестовые данные (`COMPATIBILITY`, `GITHUB_RELEASE`, `MIGRATIONS`) - в `tests/consts.ts` той же папки, общие для её тестов. Помощников-функций в тестах нет: вариант данных - `{...GITHUB_RELEASE, body}` прямо в тесте. Таблицы `it.each` - в тесте.
- Импорты из `vitest` явные (`describe`, `it`, `expect`). Алиасы vitest берёт из `paths` в `tsconfig.json` (`vitest.config.ts`).
- Покрываем чистую логику, от которой зависит что-то необратимое или чужое: миграции настроек, сравнение версий, разбор ответа GitHub, совместимость. Новая такая утилита - сразу с тестом.
- **Слой API.** API-класс: `fetch` - `vi.stubGlobal` (ky читает его при каждом запросе), журнал - `vi.mock`, ошибка - статусом без повторов (403, 404), иначе ky повторит запрос. Сервис: API и экшены страницы - `vi.mock`.
- **Хук `use<Что>View` - без рендера**: `vi.mock('react-redux', () => ({useSelector: vi.fn()}))`.
  - Один слайс - `vi.mocked(useSelector).mockReturnValue({...})`; несколько - `mockImplementation((selector: (state: BaseStore) => unknown) => selector(state))` с состоянием из `tests/consts.ts` (`STATE`, варианты - константа `state` в тесте: `...STATE` и `update: {...STATE.update, request}` - каждое на своей строке).
  - Переводы - `vi.mock('react-i18next', ...)`: `useTranslation` отдаёт `t: (key: string) => key` и `i18n: {language: 'en'}`, объекты по строкам; тест сверяет ключи. Образец - `update-settings/hooks/tests/useUpdateSettingsView.test.ts`.
  - Время - `vi.setSystemTime`, версия панели - `vi.stubEnv('APP_VERSION', ...)` в `beforeAll`; в `afterAll` - `vi.useRealTimers` и `vi.unstubAllEnvs`.

## Установщик (Pester 5+, `npm run test:installer`)

- Точка входа - `installer/tests/run-tests.ps1`. `ConfigureObs.Tests.ps1` - чистые функции правки текста. `Invoke-ConfigureObs.Tests.ps1` - установка, повторная установка и удаление на образцах `installer/tests/fixtures/obs-28`, `obs-30`, `obs-33` (копия в `TestDrive`, `__ROOT__` в `[Locations]` подменяется путём копии), плюс данные моста в профилях, запущенный OBS, нет настроек, битая коллекция, сбой записи с откатом, portable, кириллица в путях, `-Mode Check` и `-Mode RemoveData`.
- `Test-ObsRunning` подменяется `Mock`. Запуск `configure-obs.ps1` из папки версии отдельным процессом `Mock` не видит, поэтому установка и удаление этим путём пропускаются, пока открыт OBS.
- Функций-помощников в `*.Tests.ps1` нет: каждая - файл `Глагол-Существительное.ps1` в `installer/tests/helpers/` (`configure/` для `Invoke-ConfigureObs.Tests.ps1`, `updater/packaging/` и `updater/run/` для `Update-Widget.Tests.ps1`; не `release/` - такие папки скрывает `.gitignore`), как в `obs-script/tests/helpers`; тест подключает их в `BeforeAll`.
- Образцы - выдуманные данные с настоящей структурой, без личных путей и паролей; `.gitattributes` держит их байты как есть (`-text`). Новый случай в формате OBS - сначала образец и тест, потом правка скрипта.
- Только синтаксис, который есть и в Pester 5, и в 6: в GitHub Actions на Windows стоит пятый.
