---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.Tests.ps1"
  - "e2e/**"
  - "playwright.config.ts"
---

# Тесты

Какими командами что проверять - `docs/internals/testing.md`.

## Панель (vitest, `npm run test:unit`)

- Входит в `npm test`, а значит и в CI. Тесты - в `tests/` рядом с кодом: `utils/settings/migrateSettings.ts` -> `utils/settings/tests/migrateSettings.test.ts`, импорт из `../`.
- Именованные тестовые данные (`COMPATIBILITY`, `GITHUB_RELEASE`, `MIGRATIONS`) - в `tests/consts.ts` той же папки, общие для её тестов. Помощников-функций в тестах нет: вариант данных - `{...GITHUB_RELEASE, body}` прямо в тесте. Таблицы `it.each` - в тесте.
- Импорты из `vitest` явные (`describe`, `it`, `expect`). Алиасы vitest берёт из `paths` в `tsconfig.app.json` (`vitest.config.ts`).
- Покрываем чистую логику, от которой зависит что-то необратимое или чужое: миграции настроек, сравнение версий, разбор ответа GitHub, совместимость. Новая такая утилита - сразу с тестом.
- **Слой API.** API-класс: `fetch` - `vi.stubGlobal` (ky читает его при каждом запросе), журнал - `vi.mock`, ошибка - статусом без повторов (403, 404), иначе ky повторит запрос. Сервис: API и экшены страницы - `vi.mock`.
- **Хук `use<Что>View` - без рендера**: `vi.mock('react-redux', () => ({useSelector: vi.fn()}))`.
  - Один слайс - `vi.mocked(useSelector).mockReturnValue({...})`; несколько - `mockImplementation((selector: (state: BaseStore) => unknown) => selector(state))` с состоянием из `tests/consts.ts` (`STATE`, варианты - константа `state` в тесте: `...STATE` и `update: {...STATE.update, request}` - каждое на своей строке).
  - Переводы - `vi.mock('react-i18next', ...)`: `useTranslation` отдаёт `t: (key: string) => key` и `i18n: {language: 'en'}`, объекты по строкам; тест сверяет ключи. Образец - `update-settings/hooks/tests/useUpdateSettingsView.test.ts`.
  - Время - `vi.setSystemTime`, версия панели - `vi.stubEnv('APP_VERSION', ...)` в `beforeAll`; в `afterAll` - `vi.useRealTimers` и `vi.unstubAllEnvs`.
  - Хук карточки, который отдаёт строки с JSX (`useOutputCardView`, `useItems`), проверяем по тексту, который видит стример, а не по устройству разметки: значение строки - `renderToStaticMarkup(createElement(Fragment, null, value)).replace(MARKUP_TAG_PATTERN, '')` (`react-dom/server`), обёртки - заглушки в `vi.mock` (`antd` с `Tag` и `theme.useToken`, `advice-hint` отдаёт `children`, `congestion-progress` и `lag-value` - строку из своих пропсов), `t` из `react-i18next` и `i18next` возвращает ключ и подстановки (`units.gigabytes 5.3`). Числа сверяем все, тексты - ключами.
- **Показатели статистики** проверяются по слоям: расчёт из ответов OBS - `StatsTracker` (битрейт, потери, «в минуту», загрузка сети, время, статус, остановка, сброс счётчиков OBS, карточка OBS), границы статуса - `getHealthLevel`, окно «в минуту» - `RecentCounter`, числа для экрана - `pages/Stats/utils` (`formatPercent`, `formatFixed`, `formatMemory` и другие), итоговые строки карточек - тесты хуков. Новый показатель - тест на каждом из слоёв, через который он проходит.

## E2e панели (Playwright, `npm run test:e2e`)

- Как устроено и почему так - `docs/internals/testing.md`, «E2e панели». Запуск - только `npm run test:e2e` (сборка и Docker); `npx playwright test` на Windows даст другие шрифты. Задание CI - `e2e` в `ci.yml`.
- **Раскладка**: `e2e/specs/<область>/{<сценарий>.spec.ts, consts.ts, __snapshots__/<проект>/}` (область - экран: `stats`, `settings`, `mocksOff`; сценарии экрана - файлами в его папке, а не новыми папками, пока их не больше 7; имена снимков в папке не повторяются), страницы - `e2e/pages/<Имя>.ts` (класс: локаторы - `readonly` поля из конструктора, действия - стрелочные поля, без проверок), общее - `e2e/{fixtures,consts,types}.ts`, функции для страницы (`addInitScript`) - `e2e/utils/` по одной на файл. Импорт снаружи папки - алиас `__e2e/*` (`e2e/tsconfig.json`: Node и DOM вместе, лежит в папке, чтобы VS Code нашёл его сам; knip знает его из своих `paths`).
- **Page object из фикстуры**, не синглтон: у каждого теста своя `page`. Новая страница - класс в `pages/` и поле в `DockFixturesDto` и `test.extend`.
- **Тест - сценарий пользователя**, шаги - `test.step` с названием по смыслу, тесты друг от друга не зависят, повторов нет (`retries: 0`). Проверки - `expect` в спеке, с подписью у проверок в цикле (`expect(card, 'the live card "X"')`).
- **Локаторы - по роли и подписи** (`getByRole`, `getByText` с `exact`), английский интерфейс. Классы CSS-модулей и antd не используем. Нет роли и подписи - `data-testid` в разметке панели (`output-card`, `general-card`), только там, где без него никак.
- **Время - только `page.clock.runFor`**, `waitForTimeout` не пишем. Анимации antd (rc-motion) нужны и кадры по часам страницы, и немного настоящего времени: на медленной машине CI один рывок `runFor` анимацию не доигрывает. Поэтому появление и исчезновение с анимацией (тост, ошибка под полем формы) ждём `utils/advanceClockUntil(page, timeout => expect(...).toBeHidden({timeout}))`: шаги `runFor(ANIMATION_CLOCK_STEP_MS)` в `expect(...).toPass()`, но время страницы за ожидание - всегда одно и то же (`ANIMATION_WAIT_MS`, остаток догоняем после): иначе число опросов симулятора зависит от скорости машины и цифры на снимках плывут. Проверка на медленной машине - временно `Emulation.setCPUThrottlingRate` (8) в фикстуре `page`.
- **Перетаскивание** (dnd-kit) - `StatsPage.dragCard`: мышью за ручку (`img` `holder`), сначала сдвиг больше порога датчика (5 px), потом к цели по шагам, после отпускания - `runFor`: панель возобновляет обновление карточек по таймеру (`VIEW_RESUME_DELAY_MS`), и до него переход по шапке не отрисуется.
- **Сеть в тесте** - только подменой: `page.route(<адрес>, route => route.fulfill({json, headers: CORS_HEADERS}))` до действия (страница `file://`, без `access-control-allow-origin` браузер ответ не отдаст). Действие, которое само ходит в сеть (включение автообновления), без подмены уронит тест через сторожа - так и задумано.
- **Снимки**: `toHaveScreenshot` с `fullPage` после `scrollToTop` (липкая шапка иначе ляжет посередине), ARIA - `toMatchAriaSnapshot` с именем. В снимок не попадает то, что меняется с коммитом: версия и метка сборки в «Обновлениях» (группу перед снимком сворачиваем). Поменял интерфейс нарочно - `npm run test:e2e:update` и новые эталоны в том же коммите, глазами по диффу.

## Установщик (Pester 5+, `npm run test:installer`)

- Точка входа - `installer/tests/run-tests.ps1`. `ConfigureObs.Tests.ps1` - чистые функции правки текста. `Invoke-ConfigureObs.Tests.ps1` - установка, повторная установка и удаление на образцах `installer/tests/fixtures/obs-28`, `obs-30`, `obs-33` (копия в `TestDrive`, `__ROOT__` в `[Locations]` подменяется путём копии), плюс данные моста в профилях, запущенный OBS (и открытый во время настройки), занятая и брошенная блокировка, нет настроек, битая коллекция, сбой записи с откатом, portable, кириллица в путях, `-Mode Check` и `-Mode RemoveData`. Скорость разбора - коллекция на 6,6 МБ в `ConfigureObs.Tests.ps1` (меньше 10 с; рекурсивный разбор шёл бы около двух минут).
- `Test-ObsRunning` подменяется `Mock`. Запуск `configure-obs.ps1` из папки версии отдельным процессом `Mock` не видит, поэтому установка и удаление этим путём пропускаются, пока открыт OBS.
- Функций-помощников в `*.Tests.ps1` нет: каждая - файл `Глагол-Существительное.ps1` в `installer/tests/helpers/` (`configure/` для `Invoke-ConfigureObs.Tests.ps1`, `updater/packaging/` и `updater/run/` для `Update-Widget.Tests.ps1`; не `release/` - такие папки скрывает `.gitignore`), как в `obs-script/tests/helpers`; тест подключает их в `BeforeAll`.
- Образцы - выдуманные данные с настоящей структурой, без личных путей и паролей; `.gitattributes` держит их байты как есть (`-text`). Новый случай в формате OBS - сначала образец и тест, потом правка скрипта.
- Только синтаксис, который есть и в Pester 5, и в 6: в GitHub Actions на Windows стоит пятый.
