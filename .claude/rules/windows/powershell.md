---
paths:
  - "**/*.ps1"
---

# PowerShell, своё

Общее - `.claude/rules/common/windows/powershell.md`. Как устроены настройка OBS и обновлятор - `docs/internals/installer.md` и `docs/internals/updater.md`, читаем перед правкой этих частей.

- **Чистые функции правки текста** - `Add-BridgeScript`, `Add-BrowserDock`, `Set-IniValue`, `Enable-WebSocketServer`; файлы читают и пишут только `Get-ObsChanges` и `Save-ObsChanges`.
- **Файлы OBS**: `Read-JsonValue` разбирает JSON с позициями по уровням, вложенное раскрывает `Get-JsonMember`. Правка трогает только элемент `scripts-tool` и значение `server_enabled`, в ini - одну строку.
- **Точки входа со сбросом `PSModulePath`** - `configure-obs.ps1`, `installer/tests/run-tests.ps1`.
- **Константы** - `installer/ConfigureObs/consts.ps1` и `installer/updater/UpdateWidget/consts.ps1`, установщик копирует их вместе с функциями. Переменная состояния - `$script:ConfigureLogPath`.
