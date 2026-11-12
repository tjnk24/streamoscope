# Обновлятор: как устроен

Что делают мост и панель - `bridge.md` и `dock.md`, правила PowerShell - `.claude/rules/windows/powershell.md`.

- **`installer/updater/Update-Widget.ps1`**, функции - `installer/updater/UpdateWidget/` (`download/`, `versions/`, `rollback/`). Входит в выпуск и лежит в `versions/<версия>/updater`, поэтому обновляется вместе с программой. Папку установки и `minisign.exe` находит от своего положения.
- **`minisign.exe` - только в `{app}\updater`**, его кладёт установщик: скачанные программы не запускаем (решение пользователя).
- **Запуск - из моста**: `-Version X.Y.Z` (кнопка «Обновить») или `-Auto` (фоновая проверка). Остальные параметры - по умолчанию: адреса выпусков, публичный ключ строкой (тест сверяет его с `minisign.pub`), файл статуса `%LOCALAPPDATA%\streamoscope\update-status.json`.
- **`-Auto` (`Invoke-AutoUpdate`)** с пониженным приоритетом, не чаще раза в `AutoCheckMinIntervalHours` по метке `update-check.stamp` (неудачный запрос меткой не считается):
  - поправляет `DisplayVersion` в «Приложениях» (после отката он отстаёт);
  - берёт из API GitHub тег и дату последнего выпуска и решает (`Get-AutoUpdateAction`): не новее - `upToDate`, другая major-версия - `manualOnly`, не новее откаченной - `rolledBack`, моложе `AutoInstallDelayHours` (48 ч, чтобы успеть отозвать плохой выпуск) - `tooFresh`, иначе ставит.
- **Порядок установки (`Invoke-UpdateWidget`)**:
  1. Блокировка `update-status.json.lock` (второй запуск - `busy`).
  2. Версия вида `X.Y.Z` и новее текущей из `current-version.js` (та же - сразу `done`, старше - `notNewer`).
  3. Скачать `compatibility.json`, проверить подпись, сверить в нём версию и минимальную версию OBS с `obs64.exe` (`Get-ObsVersion` через `Find-ObsDirectory` из `ConfigureObs` своей версии, `versions\<версия>\ConfigureObs`; в версиях, собранных до 0.7.0, его там нет - тогда из `{app}\ConfigureObs`).
  4. Скачать `streamoscope-<версия>.zip` с процентами, проверить подпись.
  5. Распаковать в `versions/staging-<версия>`, проверить состав (`RequiredPackageFiles`) и версию внутри, переместить в `versions/<версия>` (`Expand-UpdatePackage`).
  6. Записать `update-trial.txt` (`Write-UpdateTrial`).
  7. Атомарно заменить `current-version.js` (`Set-CurrentVersion`, `File.Replace`): всё до этого шага текущую версию не трогает.
  8. Стереть `rolled-back-version.txt`, оставить три новые версии и версию для отката (`Remove-OldVersions`), обновить `DisplayVersion` -> `done`.
- **Любое скачивание - `Get-UpdateFile`**: `DownloadTimeoutMilliseconds` (30 с) на ответ и на каждое чтение, целиком не дольше `DownloadDeadlineMilliseconds` (10 минут), длина должна совпасть с `Content-Length`; иначе ошибка `network`, а не `signature`.
- **Статус** - JSON `{version, stage, percent, error, updated}`. Этапы: `preparing`, `downloading`, `verifying`, `installing`, `done`, `failed`. Коды ошибок: `invalidVersion`, `notNewer`, `network`, `signature`, `incompatible`, `install`, `unexpected`.
- **Временные файлы** - `%TEMP%\streamoscope-update-<версия>`, удаляются всегда.
- **Тесты (`Update-Widget.Tests.ps1`)** - на поддельном выпуске в `TestDrive` по `file:///` с временными ключами, версия OBS и запись в реестр подменяются `Mock`. `npm run test:installer` сначала достаёт `minisign.exe` (`scripts/buildInstaller/fetchMinisign.ts`).
