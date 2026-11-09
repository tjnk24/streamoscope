---
paths:
  - "src/**/*.tsx"
  - "src/**/*.scss"
  - "src/utils/theme.ts"
---

# Панель: стили и кнопки

- **CSS-модули (`.module.scss`)**, без БЭМ-функций и less.
- **Формы antd отправляются из `onClick` кнопки, а не через `onFinish`/`onSubmit` формы.** Обработчик `onSubmit` - асинхронная функция: берёт значения через `await form.validateFields()` (при ошибке валидации он отклоняется, и обработчик дальше не идёт; ошибки под полями antd показывает сам) и вешается на `onClick` кнопки отправки - `EnhancedButton` с `htmlType: 'submit'`, чтобы Enter в поле тоже отправлял форму. Так спиннер кнопки сразу работает, если в обработчик добавится асинхронный запрос. У формы - свой экземпляр `Form.useForm()`. Если форма в компоненте одна, её экземпляр называется просто `form`, а обработчик отправки - `onSubmit`.
- **Кнопки - только `EnhancedButton`** из `__components/EnhancedButton`, antd `Button` напрямую не используем. Пропсы кнопки - в `buttonProps`, подсказка - `tooltipProps`, подтверждение - `popconfirmProps`. Спиннер включён по умолчанию (`withSpinner`): чтобы он крутился, `onClick` должен вернуть промис; выключается `withSpinner={false}`. Кнопка без `type` - обычная кнопка antd по умолчанию, светло-синяя с обводкой: её цвета задают токены `Button` (`DEFAULT_BUTTON_COLORS`) в `utils/theme.ts`.
- **Текст, который может обрезаться многоточием, - только `EnhancedText`** из `__components/EnhancedText` (решение пользователя): это `Typography.Text` с `ellipsis`, и при обрезке полный текст всплывает подсказкой при наведении, а если текст помещается, подсказки нет. Сюда же заголовки `Card`: antd обрезает их сам, поэтому `title={<EnhancedText>...</EnhancedText>}`. `ellipsis` напрямую в коде не пишем.
- **Текст рядом с кнопкой, значком или полем - всегда с заметным отступом, не вплотную**: подпись справа от кнопки (результат проверки у «Проверить обновления») - `gap={14}` у `Flex`, а не `small` (8 px).
- **Сначала возможности antd, потом свой CSS**: отступы - `Flex`/`Space` с `gap`, коробка - `Card`, текст - `Typography` с пропсами (`type`, `strong`). Свой CSS - для раскладки.
- **Инлайн-стилей нет никогда**: ни `style`, ни `styles` у компонентов antd, ни объектов `CSSProperties` в `consts.ts`. Внутренние части antd (`title`, `body`, `label`, `content`, `suffix`) правим через проп `classNames` классами из `style.module.scss`; чтобы перебить вложенные селекторы antd, класс части пишем внутри класса корня (`.card .title`, `.list .itemLabel`). Стиль по условию - условный класс (`content: isActive ? undefined : style.inactiveBitrate`), цвет из темы - CSS-переменной, а не `theme.useToken()`.
- **Цвета и отступы - CSS-переменными темы antd** (`var(--ant-color-border)`, `var(--ant-padding-xs)`, `var(--ant-margin-sm)`). Они доступны везде: класс `css-var-app` висит на `<html>`. Новые хексы в SCSS не пишем, тема - одна, в `utils/theme.ts`. `theme.useToken()` - только там, где CSS не достаёт: рисование на canvas и пропсы-цвета antd (`strokeColor` у `Progress`).
- **Все поля ввода светлее карточек**: фон любых полей (`Input`, `TextArea`, `InputNumber`, `Select`, `DatePicker`, `Cascader`, `TreeSelect`, `Mentions`) задаётся одним набором `FIELD_COLORS` в компонентных токенах темы `utils/theme.ts`. Новый тип поля - добавить его туда же, а не красить в SCSS.
- **Шрифт Inter - из пакета `@fontsource-variable/inter`** (импорт в `src/index.tsx`, в теме - `'Inter Variable'`), файлы woff2 webpack кладёт в `fonts/` сборки (`loadAssets`), а `copyReleaseFiles` - его лицензию OFL рядом (`dock/fonts/Inter-LICENSE.txt`). Внешних шрифтов и CSS по сети (Google Fonts и подобное) не подключаем: панель ходит только в obs-websocket и GitHub.
- **Своих размеров шрифта не задаём**: `font-size` и `font-weight` в SCSS - только переменными темы (`var(--ant-font-size)`), когда нужно вернуть части antd обычный размер.
- **Цвета площадок** (`PLATFORM_RULES`) - фирменные цвета, это данные, а не тема.
