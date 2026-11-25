---
paths:
  - "src/*.{ts,tsx}"
  - "src/{api,components,loaders,pages,reducers,routes,selectors,services,types,utils}/**"
  - "src/client/**"
---

# Клиент: данные, стор, сервисы и роутинг

## Стор

- **Состояние - Redux Toolkit.** Общие слайсы - `reducers/`, список - `commonSlices` (`reducers/index.ts`).
- **Слайс, нужный одной странице, - в `pages/<Страница>/reducers`** (решение пользователя: в общие - когда понадобится другим).
- **Понадобилось нескольким местам - переносим целиком в общие папки** (решение пользователя): слайс - `reducers` (в `commonSlices`, тип - в `BaseStore`), селекторы - `selectors`, лоадер - `loaders` (`__loaders/*`), сервис - `services`, API - `api/<сервис>`, компонент или контейнер - `components/<Имя>`, тип - `types`; тесты - в `tests/` рядом. В страницу, которой это понадобилось, и в соседние страницы не переносим.
  - Корневой редьюсер - `rootReducer` (`combineSlices` в `reducers/index.ts`), о страницах он не знает.
  - Страница подключает все свои слайсы одним вызовом в своём `reducers/index.ts` (решение пользователя): `export const injectedSlices = injectSlices({adviceModal: adviceModalSlice})`; `utils/redux/injectSlices` вызывает `injectInto(rootReducer)` у каждого.
  - Тип результата - `InjectedSlicesDto` (`__types/app/slices`) с точными `reducerPath` и `selectSlice`: `ReturnType` от `injectInto` расширяет имя слайса до `string`.
  - Экшены - `export const actions = bindSliceActions(injectedSlices)` в `actions.ts` страницы (`utils/redux/bindSliceActions`: `bindActionCreators` со `store.dispatch`), вызов - `actions.<слайс>.<экшен>`.
  - Селектор слайса - `injectedSlices.<слайс>.selectSlice` в `selectors/<слайс>Selectors.ts` страницы, файл на слайс (решение пользователя); до первого экшена отдаёт начальное состояние.
  - Читают через `useSelector`. Если понадобится вне React (`selectSlice(getStore())`), корневой редьюсер собираем `withLazyLoadedSlices<...>()` с `WithSlice` этого слайса: иначе тип стора о нём не знает.
- **Модалка - слайс `{isVisible, ...данные}` с `setData` и `reset`**: родитель рендерит её, только пока `isVisible`, закрытие вызывает `reset`.
- **Экшены без алиасов.** Общие - `import {commonActions} from '__actions'` (`actions.ts` корня клиента: `bindSliceActions(commonSlices)`), страницы - `import {actions} from '../../actions'`. `bound as actions` и подобные переименования не пишем.

## Селекторы

- **У каждого слайса - селектор слайса** `state => state.<слайс>` (`settingsSelector`, `updateSelector`), поля - деструктуризацией.
- **Селектор, который только достаёт поля, - плоский, без `createSelector`**, и один в другой не вкладываем (ни `createSelector` ради поля, ни `state => updateSelector(state).latest`): слайсы всегда есть, отсутствие значения - `null` в `initialState`, запоминать нечего. Производные данные для разметки - в теле компонента.
- **`createSelector` из `@reduxjs/toolkit` - только в двух случаях** (решение пользователя):
  - селектор разбора, который собирает новые данные (`parsedReleaseNotesSelector`): иначе новый массив на каждом вызове перерисовывал бы компонент;
  - селектор статуса запроса. Статус в компоненте не сравниваем: на каждый нужный статус - `<слайс>Is<Pending|Success|Failed>Selector` = `createSelector([releaseNotesSelector], checkPending)`. `checkPending`, `checkSuccess`, `checkFailed` (`utils/redux`) сами берут `status` из слайса, поэтому без обёртки. Ненужный селектор статуса не заводим (knip).
- **Несколько полей одного слайса в компоненте - одним селектором слайса**: `const {latest, request} = useSelector(updateSelector);`. Immer отдаёт новый объект слайса только при изменении; лишние перерисовки от чужих полей обычно неважны.
- **Точечный селектор поля** (`connectionStatusSelector`, `settingsPortSelector`) - только когда компоненту нужно одно поле слайса. Селектор, который собирает новый объект (`state => ({a: state.x.a})`), не пишем: перерисовка на каждое изменение стора.
- **Сервисы читают стор селектором слайса**: `const {latest} = updateSelector(getStore());`. Точечные селекторы ради сервиса не заводим, неиспользуемый удаляем (knip покажет).

## HTTP-запросы

- **В клиенте - только через `api/`, библиотека `ky`** (решение пользователя: транспорты и API-классы, не привязанные к одному сервису). Вне слоя - только то, что названо в правилах проекта.
- **Транспорт - как говорить с сервером.**
  - `utils/api/baseTransport.ts` (`ky.create`) - общий; хук `beforeError` сообщает об ошибке запроса туда, где проект их собирает.
  - На каждый внешний сервис - `baseTransport.extend` (`<сервис>/transport/<сервис>Transport.ts`: `baseUrl` и заголовки). Токены и свои хуки сервиса - только в его транспорте.
  - Базовые транспорты разбирают JSON через `parseJson: parseJsonBody` (`utils/api`): пустое тело (204) - `null`, а не ошибка разбора.
- **API-класс - что спрашивать.** Наследует `BaseApi` (`utils/api/BaseApi.ts`, транспорт - в конструктор).
  - Методы на все виды запросов ky (решение пользователя): `get`, `query` (`<Результат>`), `post`, `put`, `patch`, `delete` (`<Результат = null>`) отдают разобранный JSON, `head` - сам ответ (заголовки и статус).
  - Методы - стрелочные поля, наружу - экземпляр (`export const releasesApi = new ReleasesApi()`).
  - Только HTTP: эндпоинт, параметры, сырой тип ответа; ответ отдаёт как есть.
  - Параметры (query, части пути, тело) не зашиваем (решение пользователя): метод принимает их типизированным аргументом с именем поля опций ky (`searchParams`, `json`), чтобы передавать сокращённо - `getList = (searchParams: GithubReleasesQueryDto) =>`, ниже `this.get<...>(GITHUB_ROUTES.RELEASES.INDEX, {searchParams})`.
  - Тело метода - всегда с новой строки после `=>` с отступом, даже короткое, и в `BaseApi` тоже (решение пользователя).
- **Эндпоинты - `routes/api/<api>.ts`**, объект вида `ROUTES` (`GITHUB_ROUTES` в `routes/api/github.ts`: `RELEASES.INDEX`, `RELEASES.LATEST`), не в `consts.ts` (решение пользователя). Эндпоинт с частью пути - функция: `` RELEASE: (releaseId: string) => `releases/${releaseId}` ``.
- **Сервис - что делать с запросом и ответом** (решение пользователя): класс с экземпляром, методы-обработчики (`handleRequest`) вызывают лоадер или API со значениями параметров прямо в вызове (`releaseNotesLoader({per_page: 30})`), а не константами из `preload` или контейнера.
  - Ответ идёт в Redux - через лоадер, разбор для разметки - селектор; в сервисе только вызов лоадера.
  - Результат нужен самому сервису или другим сервисам - сервис сам разбирает ответ, решает особые статусы (404 через `isHTTPError`) и отдаёт наши DTO.
- **Данные с сервера в Redux** (решение пользователя):
  - слайс запроса `createRequestSlice<Данные>(имя)` (`utils/redux`): `{status, data, error}`, типы `RequestStateDto` и `RequestStatusEnum` (`__types/api/request`), экшены `pending`, `success`, `failed`, `reset`;
  - лоадер `createLoader(actions.<слайс>, <api>.<метод>)` в `loaders/<что>Loader.ts`: принимает параметры, вызывает `pending`, метод API, затем `success(ответ как есть)` или `failed(текст ошибки)`; ничего не бросает, о сервисах не знает (сервис в создание не передаём);
  - `preload` (`utils/hocs/preload`) вызывает метод сервиса в `onLoad` и сбрасывает слайс в `onDispose`;
  - компонент берёт флаги из селекторов статуса, данные - из селектора разбора.
- **Компоненты и `preload` зовут методы сервиса и читают слайс**, API и лоадеры напрямую не вызывают.
- **Раскладка - по тому, кто пользуется** (решение пользователя):
  - нужное одной странице - в её `api/`, `services/`, `loaders/`, `reducers/`, `selectors/`;
  - нужное нескольким местам или общим сервисам - в одноимённых папках корня клиента;
  - папка на сервис: `api/<сервис>/{<Что>Api.ts, transport/{<сервис>Transport.ts, consts.ts}}`, в `consts.ts` - базовый адрес и заголовки.
- **Типы ответа** - из пакета типов сервиса, если он есть (GitHub - `@octokit/openapi-types`: `GithubReleaseDto` - `Pick` нужных полей из `components['schemas']['release']`, чтобы тестовым данным не нужны были все поля), иначе свой DTO в `types`.
  - Сырые типы - только в API-классе, слайсе с сырым ответом и селекторе разбора (или в сервисе, который разбирает сам); компоненты получают наши DTO.
  - Тип параметров (`GithubReleasesQueryDto` из `operations` octokit) - тип аргумента метода API, двойника-DTO не заводим.
- **Импорты не замыкаем**: `reducers` и `store.ts` ничего не импортируют из `api` и `utils/api`.
- **Тесты слоя** - `tests/vitest.md`.

## Хранилище

- **Формат сохраняемых настроек - с версией и миграциями** (если проект хранит настройки). Номер - `settingsVersion`, без номера - версия 1. При загрузке `storageService` прогоняет настройки по цепочке переходов N -> N+1 до текущей версии и сохраняет.
  - Поменял формат (переименовал поле, поменял тип или смысл, разделил поле) - подними версию, допиши функцию перехода, которая переносит выбор пользователя, и тест на неё.
  - Новое поле со значением по умолчанию миграции не требует.
  - Функции перехода не удаляем никогда: кто-то обновится прямо с той версии.
  - Настройки, которые не разбираются или пришли из более новой версии, откладываем и берём значения по умолчанию.
- **К `localStorage` ходит только `services/storageService.ts`**: методы по смыслу данных (`loadSettings`, `saveSettings`), ключи и безопасные `private getItem`, `setItem`, `removeItem` (ловят исключения `localStorage`) - внутри.

## Роутинг

- **Ссылки строит `routerManager`** (`services/routerManager.ts`: методы `goTo<Страница>()`, с `isHref` - только путь для `<Navigate>`), адреса строками не собираем. Роуты приложения - `ROUTES` в `routes/app.ts` (импорт `__routes/app`), эндпоинты API - рядом в `routes/api/`. Вид роутера - в правилах проекта.
