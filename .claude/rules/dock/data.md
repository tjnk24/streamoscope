---
paths:
  - "src/**"
---

# Панель: данные, стор, сервисы и роутинг

Как устроены обновления, плашка моста, диагностика, вход и моки - `docs/internals/dock.md`, читаем перед правкой этих частей.

## Стор

- **Состояние - Redux Toolkit.** Общие слайсы - `src/reducers`, список - `commonSlices` (`src/reducers/index.ts`):
  - `connection` - статус соединения, код последнего закрытия, версия OBS, текущая коллекция сцен;
  - `stats` - найденные выходы и данные карточек;
  - `update` - последний выпуск, состояние проверки, обновлятор и статус от моста, запрос установки `request` (версия и время);
  - `@localStorage/settings` - сохраняет в localStorage мидлвара из `store.ts`.
- **Слайс, нужный одной странице, - в `pages/<Страница>/reducers`** (решение пользователя: в общие - когда понадобится другим).
  - Корневой редьюсер - `rootReducer` (`combineSlices` в `src/reducers/index.ts`), о страницах он не знает.
  - Страница подключает все свои слайсы одним вызовом в своём `reducers/index.ts` (решение пользователя): `export const injectedSlices = injectSlices({releaseNotesModal: releaseNotesModalSlice, releaseNotes: releaseNotesSlice})`; `utils/redux/injectSlices` вызывает `injectInto(rootReducer)` у каждого.
  - Тип результата - `InjectedSlicesDto` (`__types/app/slices`) с точными `reducerPath` и `selectSlice`: `ReturnType` от `injectInto` расширяет имя слайса до `string`.
  - Экшены - `export const actions = bindSliceActions(injectedSlices)` в `actions.ts` страницы (`utils/redux/bindSliceActions`: `bindActionCreators` со `store.dispatch`), вызов - `actions.<слайс>.<экшен>`.
  - Селектор слайса - `injectedSlices.<слайс>.selectSlice` в `selectors/<слайс>Selectors.ts` страницы, файл на слайс (решение пользователя); до первого экшена отдаёт начальное состояние.
  - Читают через `useSelector`. Если понадобится вне React (`selectSlice(getStore())`), корневой редьюсер собираем `withLazyLoadedSlices<...>()` с `WithSlice` этого слайса: иначе тип стора о нём не знает.
- **Модалка - слайс `{isVisible, ...данные}` с `setData` и `reset`**: родитель рендерит её, только пока `isVisible`, закрытие вызывает `reset` (`adviceModal` в `pages/Stats`, `releaseNotesModal` в `pages/Settings`).
- **Экшены без алиасов.** Общие - `import {commonActions} from '__actions'` (`src/actions.ts`: `bindSliceActions(commonSlices)`), страницы - `import {actions} from '../../actions'`. `bound as actions` и подобные переименования не пишем.

## Селекторы

- **У каждого слайса - селектор слайса** `state => state.<слайс>` (`connectionSelector`, `statsSelector`, `settingsSelector`, `updateSelector`), поля - деструктуризацией.
- **Селектор, который только достаёт поля, - плоский, без `createSelector`**, и один в другой не вкладываем (ни `createSelector` ради поля, ни `state => updateSelector(state).latest`): слайсы всегда есть, отсутствие значения - `null` в `initialState`, запоминать нечего. Производные данные для разметки - в теле компонента.
- **`createSelector` из `@reduxjs/toolkit` - только в двух случаях** (решение пользователя):
  - селектор разбора, который собирает новые данные (`parsedReleaseNotesSelector`): иначе новый массив на каждом вызове перерисовывал бы компонент;
  - селектор статуса запроса. Статус в компоненте не сравниваем: на каждый нужный статус - `<слайс>Is<Pending|Success|Failed>Selector` = `createSelector([releaseNotesSelector], checkPending)`. `checkPending`, `checkSuccess`, `checkFailed` (`utils/redux`) сами берут `status` из слайса, поэтому без обёртки. Ненужный селектор статуса не заводим (knip).
- **Несколько полей одного слайса в компоненте - одним селектором слайса**: `const {latest, bridge, request} = useSelector(updateSelector);`. Immer отдаёт новый объект слайса только при изменении; лишние перерисовки от чужих полей для `update`, `settings` и компонентов на частых полях `stats` (`useItems`) неважны.
- **Точечный селектор поля** (`connectionStatusSelector`, `statsTargetsSelector`, `statsViewSelector`, `settingsPortSelector`) - только когда компоненту нужно одно поле слайса. Селектор, который собирает новый объект (`state => ({a: state.x.a})`), не пишем: перерисовка на каждое изменение стора.
- **Сервисы читают стор селектором слайса**: `const {latest, bridge} = updateSelector(getStore());`, `settingsSelector(state).isMockEnabled`. Точечные селекторы ради сервиса не заводим, неиспользуемый удаляем (knip покажет).

## HTTP-запросы

- **Только через `src/api`, библиотека `ky`** (решение пользователя: транспорты и API-классы, не привязанные к одному сервису). Вне слоя - только obs-websocket (`obsConnectionService`).
- **Транспорт - как говорить с сервером.**
  - `utils/api/baseTransport.ts` (`ky.create`): хук `beforeError` пишет любую ошибку запроса в журнал, `source` - `api` (текст ky уже с методом и адресом).
  - На каждый внешний сервис - `baseTransport.extend` (`github/transport/githubTransport.ts`: `baseUrl` и заголовки). Токены и свои хуки сервиса - только в его транспорте.
  - Оба базовых транспорта (`baseTransport`, `devTransport`) разбирают JSON через `parseJson: parseJsonBody` (`utils/api`): пустое тело (204) - `null`, а не ошибка разбора.
- **API-класс - что спрашивать.** Наследует `BaseApi` (`utils/api/BaseApi.ts`, транспорт - в конструктор).
  - Методы на все виды запросов ky (решение пользователя): `get`, `query` (`<Результат>`), `post`, `put`, `patch`, `delete` (`<Результат = null>`) отдают разобранный JSON, `head` - сам ответ (заголовки и статус).
  - Методы - стрелочные поля, наружу - экземпляр (`export const releasesApi = new ReleasesApi()`).
  - Только HTTP: эндпоинт, параметры, сырой тип ответа; ответ отдаёт как есть.
  - Параметры (query, части пути, тело) не зашиваем (решение пользователя): метод принимает их типизированным аргументом с именем поля опций ky (`searchParams`, `json`), чтобы передавать сокращённо - `getList = (searchParams: GithubReleasesQueryDto) =>`, ниже `this.get<...>(GITHUB_ROUTES.RELEASES.INDEX, {searchParams})`.
  - Тело метода - всегда с новой строки после `=>` с отступом, даже короткое, и в `BaseApi` тоже (решение пользователя).
- **Эндпоинты - `src/routes/api/<api>.ts`**, объект вида `ROUTES` (`GITHUB_ROUTES` в `routes/api/github.ts`: `RELEASES.INDEX`, `RELEASES.LATEST`), не в `consts.ts` (решение пользователя). Эндпоинт с частью пути - функция: `` RELEASE: (releaseId: string) => `releases/${releaseId}` ``.
- **Сервис - что делать с запросом и ответом** (решение пользователя): класс с экземпляром, методы-обработчики (`handleRequest`) вызывают лоадер или API со значениями параметров прямо в вызове (`releaseNotesLoader({per_page: 30})`), а не константами из `preload` или контейнера.
  - Ответ идёт в Redux - через лоадер, разбор для разметки - селектор; в сервисе только вызов лоадера.
  - Результат нужен самому сервису или другим сервисам - сервис сам разбирает ответ, решает особые статусы и отдаёт наши DTO (`updateService.fetchLatest`: 404 через `isHTTPError` - «новых версий нет», строка о 404 в журнале остаётся).
- **Данные с сервера в Redux** (решение пользователя):
  - слайс запроса `createRequestSlice<Данные>(имя)` (`utils/redux`): `{status, data, error}`, типы `RequestStateDto` и `RequestStatusEnum` (`__types/api/request`), экшены `pending`, `success`, `failed`, `reset`;
  - лоадер `createLoader(actions.<слайс>, <api>.<метод>)` в `loaders/<что>Loader.ts`: принимает параметры, вызывает `pending`, метод API, затем `success(ответ как есть)` или `failed(текст ошибки)`; ничего не бросает, о сервисах не знает (сервис в создание не передаём);
  - `preload` (`utils/hocs/preload`) вызывает метод сервиса в `onLoad` и сбрасывает слайс в `onDispose`;
  - компонент берёт флаги из селекторов статуса, данные - из селектора разбора.
- **Компоненты и `preload` зовут методы сервиса и читают слайс**, API и лоадеры напрямую не вызывают.
- **Раскладка - по тому, кто пользуется** (решение пользователя):
  - нужное одной странице - в её `api/`, `services/`, `loaders/` (образец - `pages/Settings`: `ReleaseNotesApi`, `releaseNotesService`, `releaseNotesLoader`, слайс `releaseNotes` с сырым ответом, `releaseNotesSelectors`);
  - нужное нескольким местам или общим сервисам - в `src/api`, `src/services` (`api/github/ReleasesApi.ts` - только `getLatest` для `updateService`);
  - папка на сервис: `src/api/<сервис>/{<Что>Api.ts, transport/{<сервис>Transport.ts, consts.ts}}`, в `consts.ts` - базовый адрес и заголовки.
- **Типы ответа** - из пакета типов сервиса, если он есть (GitHub - `@octokit/openapi-types`: `GithubReleaseDto` - `Pick` нужных полей из `components['schemas']['release']`, чтобы тестовым данным не нужны были все поля), иначе свой DTO в `src/types`.
  - Сырые типы - только в API-классе, слайсе с сырым ответом и селекторе разбора (или в сервисе, который разбирает сам); компоненты получают наши DTO.
  - Тип параметров (`GithubReleasesQueryDto` из `operations` octokit) - тип аргумента метода API, двойника-DTO не заводим.
- **Импорты не замыкаем**: `src/reducers` и `store.ts` ничего не импортируют из `src/api` и `utils/api` (`baseTransport` тянет журнал, а он - стор).
- **Тесты слоя** - `.claude/rules/tests.md`.
- **Dev-сервер - тоже через слой**: `src/api/dev` (`DevApi`: `getObsConnection`, `sendJournal(body)`, `openJournalFolder`), эндпоинты - `DEV_ROUTES` в `src/routes/api/dev.ts`.
  - Транспорт свой - `ky.create({baseUrl: '/dev/'})` без `baseTransport`: его хук журнала при выключенном dev-сервере писал бы в журнал по кругу.
  - В production-сборку не попадает (`CLAUDE.md`, «Безопасность»). Вызов `fetchDevObsConnection` - прямо в ветке `if (process.env.IS_DEV_SERVER)`, не в поле класса: иначе сборка его не вырежет.

## Хранилище и OBS

- **Формат настроек - с версией и миграциями.** Номер - `settingsVersion`, без номера - версия 1. При загрузке `storageService` прогоняет настройки по цепочке переходов N -> N+1 до текущей версии и сохраняет.
  - Поменял формат (переименовал поле, поменял тип или смысл, разделил поле) - подними версию, допиши функцию перехода, которая переносит выбор пользователя, и тест на неё.
  - Новое поле со значением по умолчанию миграции не требует.
  - Функции перехода не удаляем никогда: кто-то обновится прямо с той версии.
  - Настройки, которые не разбираются или пришли из более новой версии, откладываем и берём значения по умолчанию.
- **Хранилище - `services/storageService.ts`**: пароль (`loadPassword`, `savePassword`), настройки (`loadSettings`, `saveSettings`), последние события журнала (`loadJournal`, `saveJournal`). Ключи и безопасные `private getItem`, `setItem`, `removeItem` (ловят исключения `localStorage`) - внутри; к `localStorage` больше никто не обращается.
- **Соединение с obs-websocket - `services/obsConnectionService.ts`**, вне React: переход между страницами не рвёт связь и не сбрасывает графики. Компоненты вызывают методы сервиса, а не шлют сообщения сами.
- **Разовый запрос к OBS - `obsConnectionService.sendRequest`**, ответ отдельно не ждём.
  - Запрос встаёт в очередь, сервис сразу запускает внеочередной `poll`; если прошлая пачка ещё в пути - уйдёт со следующей (`buildBatch`).
  - Пока OBS не ответил на `Identify` (`isIdentified`), `poll` ничего не шлёт: запрос ждёт первой пачки после входа. Разрыв связи очередь очищает.
- **Параметр профиля для моста** (команды обновления, журнала, открытия ссылки) - только `obsConnectionService.setProfileParameter(параметр, значение)`, вызов в одну строку; через `sendRequest` не пишем.
  - Очередь `utils/requests/ProfileParameterQueue`: один параметр - не чаще раза в `PROFILE_PARAMETER_SPACING_MS`, остальные записи ждут следующих опросов по порядку, разные параметры друг друга не ждут, разрыв связи очищает очередь. Почему - `docs/internals/bridge.md`, канал команд.

## Роутинг

- **Роутер - `createHashRouter`**: адреса внутри `#`, иначе Ctrl+R в OBS открыл бы несуществующий файл.
- **Ссылки строит `routerManager`** (`services/routerManager.ts`: `goToStats()`, `goToSettings()`, с `isHref` - только путь для `<Navigate>`), адреса строками не собираем. Роуты приложения - `ROUTES` в `src/routes/app.ts` (импорт `__routes/app`), эндпоинты API - рядом в `src/routes/api/`.
- **Редиректы на вход и обратно - в `components/AppRoute`** по статусу соединения.
