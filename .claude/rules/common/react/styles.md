---
paths:
  - "**/*.tsx"
  - "**/*.scss"
  - "**/utils/theme.ts"
  - "**/utils/appearance/**"
---

# Клиент: стили и кнопки

- **CSS-модули (`.module.scss`)**, без БЭМ-функций и less.
- **Форма antd отправляется из `onClick` кнопки, а не `onFinish`/`onSubmit` формы.** Обработчик `onSubmit` - асинхронный, значения берёт `await form.validateFields()` (при ошибке валидации отклоняется, ошибки под полями antd показывает сам). Кнопка отправки - `EnhancedButton` с `htmlType: 'submit'`, чтобы Enter в поле тоже отправлял. Так спиннер кнопки сразу работает с асинхронным запросом. У формы - свой `Form.useForm()`; форма в компоненте одна - экземпляр `form`, обработчик `onSubmit`.
- **Кнопки - только `EnhancedButton`** (`__components/EnhancedButton`), antd `Button` напрямую не используем. Пропсы - `buttonProps`, подсказка - `tooltipProps`, подтверждение - `popconfirmProps`. Спиннер включён по умолчанию (`withSpinner`, крутится, если `onClick` вернул промис), выключается `withSpinner={false}`.
- **Уведомления и сообщения antd** (`notification`, `message`, `modal`) - только из `App.useApp()`: `App` с `component={false}` стоит в `CorePage` внутри `ConfigProvider`. Статические `notification.open` не видят темы и языка, а `contextHolder` от `useNotification` пропадает вместе с компонентом, который скрылся по нажатию. Параметры вызова - константой `NotificationArgsProps` (у `message` - `MessageArgsProps`).
- **Текст, который может обрезаться многоточием, - только `EnhancedText`** (`__components/EnhancedText`, решение пользователя): `Typography.Text` с `ellipsis`, при обрезке полный текст - в подсказке, без обрезки подсказки нет. Заголовки `Card` antd обрезает сам, поэтому `title={<EnhancedText>...</EnhancedText>}`. `ellipsis` напрямую не пишем.
- **Текст рядом с кнопкой, значком или полем - с заметным отступом**: подпись справа от кнопки - `gap={14}` у `Flex`, а не `small` (8 px).
- **Загрузка - `Skeleton` вокруг содержимого** (решение пользователя): `<Skeleton loading={isPending} active>...</Skeleton>`; отдельный `{isPending && <Skeleton active/>}` и проверки `!isPending` внутри не пишем.
- **Сначала возможности antd, потом свой CSS**: отступы - `Flex`/`Space` с `gap`, коробка - `Card`, текст - `Typography` с пропсами (`type`, `strong`). Свой CSS - для раскладки. Исключения - только названные в правилах проекта.
- **Инлайн-стилей нет**: ни `style`, ни `styles` у antd, ни `CSSProperties` в `consts.ts`.
  - Исключение - `transform` и `transition` от `useSortable` (dnd-kit) у перетаскиваемого элемента: их пересчитывают на каждом кадре перетаскивания, классом не задать.
  - Внутренние части antd (`title`, `body`, `label`, `content`, `suffix`) - через `classNames` классами из `style.module.scss`; чтобы перебить вложенные селекторы antd, класс части пишем внутри класса корня (`.card .title`, `.list .itemLabel`).
  - Стиль по условию - условный класс (`content: isActive ? undefined : style.inactive`), цвет темы - CSS-переменной, а не `theme.useToken()`.
- **Цвета и отступы - CSS-переменные темы antd** (`var(--ant-color-border)`, `var(--ant-padding-xs)`, `var(--ant-margin-sm)`), доступны везде: класс `css-var-app` на `<html>`. Новых хексов в SCSS нет, тема может быть и светлой. `theme.useToken()` - только где CSS не достаёт: canvas и пропсы-цвета antd (`strokeColor` у `Progress`).
- **Ховер - смесь с цветом текста**: тёмный алгоритм antd даёт `colorLinkHover` (ссылки, кнопки `type: 'link'`, иконка `copyable`) и `colorErrorBorderHover` (рамка поля с ошибкой) темнее основного цвета, поэтому оба задаём в `token` темы смесью с текстом: на тёмной теме светлее, на светлой темнее. Новый токен ховера понадобился - туда же и так же. Сам `colorLink` из `token` antd пересчитывает, поэтому он задан в компонентных токенах `Button` и `Typography`: новый компонент со ссылками - туда же.
- **Шрифты - только пакетами** (`@fontsource-variable/<имя>`, импорт в `index.tsx` клиента): внешних шрифтов и CSS по сети не подключаем.
- **Своих размеров шрифта нет**: `font-size` и `font-weight` в SCSS - только переменными темы (`var(--ant-font-size)`), чтобы вернуть части antd обычный размер.
