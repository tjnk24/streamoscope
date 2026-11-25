---
paths:
  - "src/**"
---

# Панель: раскладка, своё

Общее - `.claude/rules/common/react/structure.md`.

- **Образцы.** Компоненты - `BitrateGraph`, `CongestionProgress`, `StatList`, `LagValue`. Контейнеры - `OutputCard` (карточка в `map`, пропсом - только `target`), `Settings` (страница только расставляет контейнеры), `Login` (форма прямо в `containers/page`). Общие компоненты со стором - `AppRoute` (статус соединения), `ErrorBoundary` (`reportService`). Хуки `use<Что>View` - `update-settings/hooks/useUpdateSettingsView`, `output-card/hooks/useOutputCardView`, `main-layout/hooks/useHeaderStageView`; свой хук с селектором - `useItems`. Константа, которая остаётся в компоненте, - `hasLine` в `BitrateGraph`.
- **В `src/utils` не для страниц** - нужное сервису соединения: `StatsTracker`, `discoverTargets`, константы протокола и моста.
- **`memo`** - у `QuestionTooltipLabel` и `CardHeading`: панель перерисовывается раз в секунду, почему так - `docs/internals/dock.md`, «Перерисовка раз в секунду».
