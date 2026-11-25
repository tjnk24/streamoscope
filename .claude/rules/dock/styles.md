---
paths:
  - "src/**/*.tsx"
  - "src/**/*.scss"
  - "src/utils/theme.ts"
  - "src/utils/appearance/**"
---

# Панель: стили и кнопки, своё

Общее - `.claude/rules/common/react/styles.md`.

- **Кнопка без `type` - цвета ссылки с обводкой**: токены `Button` в `utils/appearance/buildTheme.ts`.
- **`ConfigProvider` в `CorePage` - с локалью.** Образец тоста - `main-layout/hooks/useUpdatedToast`, образец загрузки - `ReleaseNotesModal`.
- **Исключение из «сначала antd» - значения строк статистики** (`StatList`, `LagValue`; решение пользователя): `span` с классом цвета из переменной темы (`var(--ant-color-success-text)`, `var(--ant-color-text-description)`), а не `Typography.Text`. Они перерисовываются каждую секунду, а `Typography.Text` на каждую ячейку - десятки хуков; почему - `docs/internals/dock.md`, «Перерисовка раз в секунду».
- **Инлайн-стили `useSortable`** - только у `SortableCard`.
- **Тема собирается из цветов темы OBS** (`utils/appearance/buildTheme.ts`, постоянная часть и запасные палитры - `utils/theme.ts`; как - `docs/internals/dock.md`, «Тема из OBS»).
- **Смесь для ховера** - в `token` `buildTheme`, доля - `HOVER_WEIGHT`.
- **Поля ввода - цветами полей OBS**: фон и рамка всех полей (`Input`, `TextArea`, `InputNumber`, `Select`, `DatePicker`, `Cascader`, `TreeSelect`, `Mentions`) - один набор `fieldColors` в компонентных токенах `buildTheme` (`input` и `inputBorder` темы). Новый тип поля - туда же, не в SCSS.
- **Шрифт - Inter** (`@fontsource-variable/inter`, в теме `'Inter Variable'`): woff2 Rspack кладёт в `fonts/` (`loadAssets`), лицензию OFL - `copyReleaseFiles` в `dock/fonts/Inter-LICENSE.txt`. Панель ходит только в obs-websocket и GitHub.
- **Цвета площадок** (`PLATFORM_RULES`) - фирменные, это данные, а не тема; контраст с фоном карточки поднимает только `ensureContrast` при отрисовке (`useOutputCardView`).
