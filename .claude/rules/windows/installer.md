---
paths:
  - "installer/**"
  - "scripts/buildInstaller/**"
---

# Установщик (Inno Setup), своё

Общее - `.claude/rules/common/windows/installer.md` (там же - почему живую установку запускает пользователь). Как устроены установщик и настройка OBS - `docs/internals/installer.md`, читаем перед правкой этих частей.

- **Папка установки - `%LOCALAPPDATA%\Programs\streamoscope`**, запись в «Приложениях» - «StreamoScope».
- **Языки `[CustomMessages]` - `en`, `ru`, `es`, `de`, `ptbr`, `uk`, `pl`, `fr`, `ko`, `ja`, `it`, `nl`, `tr`, `th`** (языки самого Inno; китайского, вьетнамского и индонезийского у него нет, там установщик английский).
  - Названия меню OBS - дословно из его файлов перевода, как раздел `obs` словарей панели (в немецком, французском и нидерландском OBS «Docks» не переведено).
