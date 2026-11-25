---
paths:
  - "src/**"
---

# Панель: данные, стор, сервисы и роутинг, своё

Общее - `.claude/rules/common/react/data.md`. Как устроены обновления, плашка моста, диагностика, вход и моки - `docs/internals/dock.md`, читаем перед правкой этих частей.

## Стор

- **Общие слайсы** (`src/reducers`):
  - `connection` - статус соединения, код последнего закрытия, версия OBS, текущая коллекция сцен;
  - `stats` - найденные выходы и данные карточек;
  - `update` - последний выпуск, состояние проверки, обновлятор и статус от моста, запрос установки `request` (версия и время);
  - `releaseNotes` - сырой ответ GitHub для «Что нового», `releaseNotesModal` - модалка заметок (её открывают и настройки, и тост после обновления);
  - `@localStorage/settings` - сохраняет в localStorage мидлвара из `store.ts`.
- **Образцы**: вынесенное в общее - модалка «Что нового» (`src/components/ReleaseNotesModal`); слайс модалки - `adviceModal` в `pages/Stats`, общий `releaseNotesModal` рисует `MainLayout`; точечные селекторы - `connectionStatusSelector`, `statsTargetsSelector`, `settingsCardOrderSelector`, `settingsPortSelector`.
- **Лишние перерисовки от чужих полей слайса** неважны для `update`, `settings` и компонентов на частых полях `stats` (`useItems`).

## HTTP-запросы

- **Вне слоя `src/api` - только obs-websocket** (`obsConnectionService`).
- **`beforeError` в `baseTransport` пишет любую ошибку запроса в журнал**, `source` - `api` (текст ky уже с методом и адресом). Журнал тянет стор, поэтому импорт `src/api` или `utils/api` из `src/reducers` и `store.ts` замкнул бы круг.
- **Образец запроса для разметки - «Что нового»**: `api/github/ReleaseNotesApi`, `releaseNotesService`, `releaseNotesLoader`, слайс `releaseNotes` с сырым ответом, `releaseNotesSelectors`. Образец запроса для сервиса - `api/github/ReleasesApi.ts` (только `getLatest`) и `updateService.fetchLatest`: 404 - «новых версий нет», строка о 404 в журнале остаётся.
- **Dev-сервер - тоже через слой**: `src/api/dev` (`DevApi`: `getObsConnection`, `sendJournal(body)`, `openJournalFolder`), эндпоинты - `DEV_ROUTES` в `src/routes/api/dev.ts`.
  - Транспорт свой (`devTransport`, тоже с `parseJsonBody`) - `ky.create({baseUrl: '/dev/'})` без `baseTransport`: его хук журнала при выключенном dev-сервере писал бы в журнал по кругу.
  - В production-сборку не попадает (`CLAUDE.md`, «Безопасность»). Вызов `fetchDevObsConnection` - прямо в ветке `if (process.env.IS_DEV_SERVER)`, не в поле класса: иначе сборка его не вырежет.

## Хранилище и OBS

- **`storageService` хранит** пароль (`loadPassword`, `savePassword`), настройки (`loadSettings`, `saveSettings`), последние события журнала (`loadJournal`, `saveJournal`).
- **Соединение с obs-websocket - `services/obsConnectionService.ts`**, вне React: переход между страницами не рвёт связь и не сбрасывает графики. Компоненты вызывают методы сервиса, а не шлют сообщения сами.
- **Разовый запрос к OBS - `obsConnectionService.sendRequest`**, ответ отдельно не ждём.
  - Запрос встаёт в очередь, сервис сразу запускает внеочередной `poll`; если прошлая пачка ещё в пути - уйдёт со следующей (`buildBatch`).
  - Пока OBS не ответил на `Identify` (`isIdentified`), `poll` ничего не шлёт: запрос ждёт первой пачки после входа. Разрыв связи очередь очищает.
- **Параметр профиля для моста** (команды обновления, журнала, открытия ссылки) - только `obsConnectionService.setProfileParameter(параметр, значение)`, вызов в одну строку; через `sendRequest` не пишем.
  - Очередь `utils/requests/ProfileParameterQueue`: один параметр - не чаще раза в `PROFILE_PARAMETER_SPACING_MS`, остальные записи ждут следующих опросов по порядку, разные параметры друг друга не ждут, разрыв связи очищает очередь. Почему - `docs/internals/bridge.md`, канал команд.

## Роутинг

- **Роутер - `createHashRouter`**: адреса внутри `#`, иначе Ctrl+R в OBS открыл бы несуществующий файл.
- **Методы `routerManager`** - `goToStats()`, `goToSettings()`.
- **Редиректы на вход и обратно - в `components/AppRoute`** по статусу соединения.
