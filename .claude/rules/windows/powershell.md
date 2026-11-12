---
paths:
  - "**/*.ps1"
---

# PowerShell

Как устроены настройка OBS и обновлятор - `docs/internals/installer.md` и `docs/internals/updater.md`, читаем перед правкой этих частей.

- **Одна функция - один файл** `Глагол-Существительное.ps1` (одобренные глаголы PowerShell), переменные - camelCase. Правки текста (`Add-BridgeScript`, `Add-BrowserDock`, `Set-IniValue`, `Enable-WebSocketServer`) - чистые функции «текст на входе - текст на выходе», файлы читают и пишут только `Get-ObsChanges` и `Save-ObsChanges`.
- **Файлы OBS не переписываем целиком**: PowerShell 5.1 в `ConvertFrom-Json`/`ConvertTo-Json` меняет числа, экранирование и вложенность. `Read-JsonValue` разбирает JSON с позициями, правка вставляет или заменяет только нужный кусок (элемент `scripts-tool`, значение `server_enabled`), в ini - одну строку. Остальное - байт в байт, BOM и переводы строк сохраняются.
- **`PSModulePath` сбрасываем в начале точек входа** (`configure-obs.ps1`, `installer/tests/run-tests.ps1`) на пути Windows PowerShell: `powershell.exe`, запущенный из PowerShell 7 (терминал, шаг GitHub Actions по умолчанию), наследует модули седьмой версии и теряет команды вроде `Get-FileHash`.
- **Константы - в `consts.ps1` своей программы** (`$script:Имя = ...`): `installer/ConfigureObs/consts.ps1`, `installer/updater/UpdateWidget/consts.ps1`. Лежат рядом с функциями, подключаются тем же `Get-ChildItem *.ps1`, установщик копирует их вместе с функциями. В файлах функций `$script:`-констант нет; переменная состояния (`$script:ConfigureLogPath`) - не константа, остаётся у своей функции.
- **`$PSScriptRoot` - не в значениях параметров по умолчанию**: при `-File` PowerShell 5.1 его там не заполняет. Папка скрипта - в теле: `Split-Path -Parent $MyInvocation.MyCommand.Path`.
- **Внешние программы при `$ErrorActionPreference = 'Stop'`** не перенаправляем `2>&1`: в 5.1 их поток ошибок становится исключением. В функции, которая вызывает программу, - `$ErrorActionPreference = 'Continue'`, поток ошибок - `2>$null`, решение - по `$LASTEXITCODE`.
- **`.ps1` - только ASCII**: 5.1 читает файл без BOM в ANSI, кириллица ломается. Тексты для пользователя показывает установщик, а не скрипт.
