---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.Tests.ps1"
  - "e2e/**"
  - "playwright.config.ts"
---

# Тесты, своё

Общее - `.claude/rules/common/tests/{vitest,e2e,pester}.md`. Какими командами что проверять - `docs/internals/testing.md`.

## Панель (vitest, `npm run test:unit`)

- Слой API: журнал - `vi.mock`.
- Образец теста хука - `update-settings/hooks/tests/useUpdateSettingsView.test.ts`.
- Хуки карточек, которые отдают строки с JSX, - `useOutputCardView` и `useItems`. Заглушки: `antd` с `Tag` и `theme.useToken`, `advice-hint` отдаёт `children`, `congestion-progress` и `lag-value` - строку из своих пропсов.
- **Показатели статистики** проверяются по слоям: расчёт из ответов OBS - `StatsTracker` (битрейт, потери, «в минуту», загрузка сети, время, статус, остановка, сброс счётчиков OBS, карточка OBS), границы статуса - `getHealthLevel`, окно «в минуту» - `RecentCounter`, числа для экрана - `pages/Stats/utils` (`formatPercent`, `formatFixed`, `formatMemory` и другие), итоговые строки карточек - тесты хуков. Новый показатель - тест на каждом из слоёв, через который он проходит.

## E2e панели (Playwright)

- Как устроено и почему так - `docs/internals/testing.md`, «E2e панели». Задание CI - `e2e` в `ci.yml`.
- Области - экраны `stats`, `settings`, `mocksOff`; тип фикстур - `DockFixturesDto`; интерфейс в тестах английский; `data-testid` - `output-card` и `general-card`.
- **Перетаскивание** (dnd-kit) - `StatsPage.dragCard`: мышью за ручку (`img` `holder`), сначала сдвиг больше порога датчика (5 px), потом к цели по шагам, после отпускания - `runFor`: панель возобновляет обновление карточек по таймеру (`VIEW_RESUME_DELAY_MS`), и до него переход по шапке не отрисуется.
- **Подмена сети - с `headers: CORS_HEADERS`**: страница `file://`, без `access-control-allow-origin` браузер ответ не отдаст. Сама в сеть ходит, например, кнопка автообновления.
- **Снимки**: версия и метка сборки - в группе «Обновления», перед снимком её сворачиваем.

## Установщик (Pester, `npm run test:installer`)

- Точка входа - `installer/tests/run-tests.ps1`. `ConfigureObs.Tests.ps1` - чистые функции правки текста. `Invoke-ConfigureObs.Tests.ps1` - установка, повторная установка и удаление на образцах `installer/tests/fixtures/obs-28`, `obs-30`, `obs-33` (копия в `TestDrive`, `__ROOT__` в `[Locations]` подменяется путём копии), плюс данные моста в профилях, запущенный OBS (и открытый во время настройки), занятая и брошенная блокировка, нет настроек, битая коллекция, сбой записи с откатом, portable, кириллица в путях, `-Mode Check` и `-Mode RemoveData`. Скорость разбора - коллекция на 6,6 МБ в `ConfigureObs.Tests.ps1` (меньше 10 с; рекурсивный разбор шёл бы около двух минут).
- `Test-ObsRunning` подменяется `Mock`. Запуск `configure-obs.ps1` из папки версии отдельным процессом `Mock` не видит, поэтому установка и удаление этим путём пропускаются, пока открыт OBS.
- Помощники - `installer/tests/helpers/`: `configure/` для `Invoke-ConfigureObs.Tests.ps1`, `updater/packaging/` и `updater/run/` для `Update-Widget.Tests.ps1`; у моста - `obs-script/tests/helpers`.
