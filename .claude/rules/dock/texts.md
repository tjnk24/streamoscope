---
paths:
  - "src/**"
---

# Панель: локализация

- **Тексты интерфейса - только через i18next**, ни одной строки для пользователя в разметке, константах, утилитах и сервисах. В компоненте - `const {t} = useTranslation()` (`react-i18next`), вне React - `import {t} from 'i18next'`, числа - по `i18n.language`. В константах - ключ (`textKey: ParseKeys`), а не текст: константа считается один раз и не сменила бы язык.
- **Словари - `src/i18n/locales/`**, файл на язык. Эталон - `en.ts` с типом `TranslationDto`, остальные объявлены как `TranslationDto` (пропущенный или лишний ключ - ошибка компиляции). Ключи `t()` типизирует `typings/i18next.d.ts`. Подстановки - `{{name}}`. Новая строка - во все словари сразу.
- **Названия меню и окон OBS - раздел `obs` словаря**, дословно как в OBS на этом языке: `data/obs-studio/locale/*.ini`, `core/obs-websocket/data/locale/*.ini` и `core/frontend-tools/data/locale/*.ini` в папке установки OBS, без `&`. Нет перевода у OBS - берём английское, как он сам. Подсказки ссылаются вложенным ключом (`'$t(obs.tools) → $t(obs.webSocketSettings) → $t(obs.serverPort)'`), а не повторяют текст.
- **Языки - `LanguageEnum`**: английский (по умолчанию и запасной), русский, испанский, немецкий, бразильский португальский, «Жабий» (`ru-x-frog`).
  - Пока язык не выбран (`settings.language` - `null`), берётся язык OBS из `navigator.language` (`languageService.resolveLanguage`), не наш - английский. Пункта «Как в OBS» нет, в списке сразу текущий язык.
  - «Жабий» - поправки к русскому (`DeepPartial<TranslationDto>`), остальное i18next берёт из `ru`; настройки и поле порта в нём не задаются.
- **Язык выбирается в карточке «Отображение»** и меняется сразу: значение - `settings.language`, сохраняет его и вызывает `i18n.changeLanguage` `languageService.setLanguage`, компонент только передаёт выбор. Локаль antd - в `CorePage` (`ANTD_LOCALES`).
- **`strictNullChecks` включён** - без него типы i18next превращают ключи в `never`.
