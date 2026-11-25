---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "vitest.config.ts"
---

# Тесты vitest

- Входят в `npm test`, а значит и в CI. Тесты - в `tests/` рядом с кодом: `utils/settings/migrateSettings.ts` -> `utils/settings/tests/migrateSettings.test.ts`, импорт из `../`.
- Именованные тестовые данные (`GITHUB_RELEASE`, `MIGRATIONS`) - в `tests/consts.ts` той же папки, общие для её тестов. Помощников-функций в тестах нет: вариант данных - `{...GITHUB_RELEASE, body}` прямо в тесте. Таблицы `it.each` - в тесте.
- Импорты из `vitest` явные (`describe`, `it`, `expect`). Алиасы vitest берёт из `paths` в tsconfig клиента (`vitest.config.ts`).
- Покрываем чистую логику, от которой зависит что-то необратимое или чужое: миграции настроек, сравнение версий, разбор чужих ответов, совместимость. Новая такая утилита - сразу с тестом.
- Образцы - выдуманные данные с настоящей структурой, без личных путей и паролей. Новый случай в чужом формате - сначала образец и тест, потом правка кода.
- **Слой API.** API-класс: `fetch` - `vi.stubGlobal` (ky читает его при каждом запросе), ошибка - статусом без повторов (403, 404), иначе ky повторит запрос. Сервис: API и экшены страницы - `vi.mock`.
- **Хук `use<Что>View` - без рендера**: `vi.mock('react-redux', () => ({useSelector: vi.fn()}))`.
  - Один слайс - `vi.mocked(useSelector).mockReturnValue({...})`; несколько - `mockImplementation((selector: (state: BaseStore) => unknown) => selector(state))` с состоянием из `tests/consts.ts` (`STATE`, варианты - константа `state` в тесте: `...STATE` и `update: {...STATE.update, request}` - каждое на своей строке).
  - Переводы, если есть, - `vi.mock('react-i18next', ...)`: `useTranslation` отдаёт `t: (key: string) => key` и `i18n: {language: 'en'}`, объекты по строкам; тест сверяет ключи.
  - Время - `vi.setSystemTime`, версия - `vi.stubEnv('APP_VERSION', ...)` в `beforeAll`; в `afterAll` - `vi.useRealTimers` и `vi.unstubAllEnvs`.
  - Хук, который отдаёт JSX, проверяем по тексту, который видит пользователь, а не по устройству разметки: значение - `renderToStaticMarkup(createElement(Fragment, null, value)).replace(MARKUP_TAG_PATTERN, '')` (`react-dom/server`), обёртки - заглушки в `vi.mock` (`antd` - только нужное, свои компоненты отдают `children` или строку из своих пропсов), `t` из `react-i18next` и `i18next` возвращает ключ и подстановки (`units.gigabytes 5.3`). Числа сверяем все, тексты - ключами.
