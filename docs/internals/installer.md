# Установщик и настройка OBS: как устроены

Форматы настроек OBS - `docs/obs-config.md` (новое знание о формате дописываем туда), правила PowerShell - `.claude/rules/windows/powershell.md`.

## Настройка OBS (PowerShell)

- **`installer/configure-obs.ps1` - точка входа** для Inno Setup.
  - `-Mode Install|Uninstall|Check|RemoveData`. `Check` - только проверка, открыт ли OBS, без записи. `RemoveData` стирает данные программы из `-DataDirectory` по `$script:RemovedDataItems` (`Remove-ProgramData`), не глядя на OBS (при «удалить только файлы» он открыт); что не стёрлось - в журнал, код `1`.
  - Ещё параметры: `-InstallDirectory`, `-ObsDirectory` (portable), `-ConfigDirectory`, `-DataDirectory`.
  - Код выхода `ConfigureObsResult`: `0` готово, `1` ошибка и откат, `2` OBS запущен, `3` OBS ещё не запускали, `4` незнакомый формат (ничего не тронуто), `10` готово, но настроек obs-websocket ещё нет.
  - На экран ничего не пишет: журнал - `%LOCALAPPDATA%\streamoscope\configure-obs.log`, резервные копии - `backups\<время>` рядом (последние 5).
  - Журнал прикладывают к публичным issue, поэтому `Write-ConfigureLog` пропускает строки через `Hide-UserPath`: начало путей из `%LOCALAPPDATA%`, `%APPDATA%`, `%USERPROFILE%` (любой регистр, `\` и `/`) заменяется именем переменной. Имена коллекций и профилей остаются, о них предупреждает шаблон issue.
- **Функции - `installer/ConfigureObs/`**: `json/` (разбор с позициями, экранирование), `ini/`, `files/` (чтение и запись с проверкой, резервные копии, откат, журнал), `edits/` (правки настроек OBS), `paths/` (поиск OBS, portable, пути, запущен ли OBS); в корне - `Invoke-ConfigureObs`, `Get-ObsChanges`, `ConfigureObsResult`. Точка входа и тесты подключают их рекурсивно (`Get-ChildItem -Recurse`) от папки точки входа.
- **С 0.7.0 `configure-obs.ps1` и `ConfigureObs/` - в архиве выпуска** (`scripts/packageRelease/copyReleaseFiles.ts`), лежат в `versions\<версия>\` и приходят с фоновым обновлением; установщик кладёт запасную копию в корень папки программы.
- **Порядок:** OBS закрыт (`Test-ObsRunning`) → пути (`Resolve-ObsPaths`: portable, `[Locations]`, `user.ini` или `global.ini` по `docs/obs-config.md`) → все правки в памяти, ошибка разбора - выход без записи → резервные копии → запись через временный файл с проверкой и `File.Replace` → при любой ошибке все файлы восстанавливаются из копий → `install-manifest.json` в папке установки (что добавлено, для повторной установки и удаления).
- **Повторная установка ничего не меняет.** Удаление убирает панель (по `uuid` или адресу), мост из всех коллекций и данные моста из `basic.ini` всех профилей (`[StreamoScope]` и `[ObsStatsDock]` - имя до 0.3.0, `Remove-IniSection`); сервер WebSocket не выключает.
- **Из массивов OBS** (`scripts-tool` в коллекции, `ExtraBrowserDocks`) удаление вырезает только свой элемент с соседней запятой (`Remove-JsonArrayItem`), чужие элементы - байт в байт.
- `user.ini` никогда не создаём, пароль obs-websocket не читаем и не пишем в журнал.

## Установщик (Inno Setup)

- **Иконка - `installer/images/`**: `streamoscope.ico` (`setup.exe`, деинсталлятор, запись в «Приложениях»; копируется в `{app}`), картинки мастера `wizard-<ширина>.png` (страница завершения) и `wizard-small-<размер>.png` (угол остальных страниц) в масштабах 100/150/200 %.
  - Та же иконка: `docs/images/streamoscope-icon-512.png` (README вместо баннера; из неё нарезаны остальные), `obs-script/streamoscope-bridge/icon.png` (описание моста в OBS), `src/images/streamoscope-icon.png` 64 px (фавикон - `favicon` у `HtmlWebpackPlugin`; в шапке панели иконки нет - решение пользователя).
  - Новая иконка - пересобрать все эти файлы из одного исходника.
- **`installer/streamoscope.iss`, сборка - `npm run package:installer`**: `package:release`, затем `scripts/buildInstaller` находит `ISCC.exe` (Inno Setup 6: `ISCC_PATH`, `%LOCALAPPDATA%\Programs`, `Program Files`) и передаёт `/DAppVersion`, `/DSetupName` (имя файла), `/DPackageDir` (папка выпуска), `/DOutputDir` и у сборки не из выпуска `/DBuildLabel` (метка `webpack/init/getBuildLabel`, `.claude/rules/releases.md`).
  - Результат - `release/streamoscope-setup-<версия>.exe`; у сборки с меткой - `streamoscope-setup-<версия>-local.exe`, а к `AppVerName` (мастер) и `UninstallDisplayName` («Приложения») дописывается ` (local build <метка>)`.
  - Номер версии прежний: из него собраны `versions\<версия>`, `current-version.js` и `DisplayVersion`.
- **`minisign.exe` для обновлятора** скачивает `scripts/buildInstaller/ensureMinisign.ts`: официальный архив по точной версии и SHA-256 из `scripts/buildInstaller/consts.ts`, распаковка встроенным `%SystemRoot%\System32\tar.exe` (GNU tar из Git zip не распаковывает), кэш - `node_modules/.cache/minisign/<версия>`. Бинарника в репозитории нет. Установщик кладёт его в `{app}\updater` с лицензией `installer/third-party/minisign-LICENSE.txt` (ISC). Меняем версию minisign - меняем версию и хэш в `consts.ts`.

## Раскладка установки

- `dock/index.html` - загрузчик панели из `installer/loader/index.html`: подставляет `current-version.js` и переходит на `../versions/<версия>/dock/index.html`, сохраняя `#`.
- `streamoscope-bridge.lua` - заглушка из `installer/loader/streamoscope-bridge.lua` (`docs/internals/bridge.md`).
- `current-version.js` - `window.STREAMOSCOPE_VERSION = 'X.Y.Z';`, читают оба загрузчика, установщик пишет в `WriteCurrentVersion`.
- `versions/<версия>/` - содержимое папки выпуска: панель, загрузчик моста и мост, `updater/`, `configure-obs.ps1` с `ConfigureObs/`.
- `updater/` - `minisign.exe` с лицензией.
- Файлы автоотката: `update-trial.txt`, `healthy-version.txt`, `healthy-process.txt`, `healthy-loader.txt` (версия, чей загрузчик последним загрузился без ошибки; пишет заглушка), `rolled-back-version.txt`.
- `ConfigureObs/` и `configure-obs.ps1` в корне - запасная копия от установщика.
- Адреса `dock/index.html` и `streamoscope-bridge.lua` записаны в настройках OBS и не меняются. Что вне `versions\` обновляет только установщик - `.claude/rules/releases.md`.
- **`[InstallDelete]`** - старые файлы, все версии, `update-status.json` (иначе карточка показала бы статус несуществующей версии) и `update-check.stamp`: запуск установщика - чистая установка. Настройки панели и журнал остаются, повторная настройка OBS ничего не меняет, поэтому последний установщик можно запускать поверх в любой момент.
- **`[UninstallDelete]`** - всё, что Inno не ставил сам: `versions`, `current-version.js`, `install-manifest.json`, файлы автоотката, журнал, состояние обновлятора (`auto-update.txt`, `update-status.json` с `.lock`, `update-check.stamp`); это запасной путь, обычно их уже стёр `RemoveData`. `backups` и `configure-obs.log` остаются, чтобы после неудачного удаления вернуть настройки OBS и понять, что случилось.
- **Журнал установка не трогает**: `%LOCALAPPDATA%\streamoscope\logs` и `journal.txt` переживают установку и обновление, удаление их стирает (`-Mode RemoveData`, запасной путь - `[UninstallDelete]`).
- **`RemoveInstallDirectory`** на `usPostUninstall` стирает папку установки целиком, только если это обычная `{userpf}\streamoscope` (установку можно увести `/DIR=`, там стирается только список) - так уйдут и файлы, которые добавят будущие версии.
- Ctrl+R в доке перезагружает текущую версию из её папки, новая откроется при следующем запуске OBS: панель и мост всегда переключаются вместе. Настройки не теряются: у всех страниц `file://` в Chromium одно хранилище.

## Деинсталлятор и запуск настройки OBS

- **Установщик только запускает `configure-obs.ps1` скрыто** (`Exec` 64-битного `powershell.exe`, `SW_HIDE`) и переводит код выхода в текст: `2` - окно «закройте OBS и повторите попытку» по кругу, отмена - установка без настройки; `3`, `4`, `1`, `10` - пояснение на последней странице, там же всегда - где искать панель и пароль WebSocket. Каждый запуск пишет в журнал Inno путь скрипта, режим и код выхода.
- **Деинсталлятор тонкий (с 0.7.0)**: его код (`[Code]`, тексты окон, `[UninstallDelete]`, `RemoveInstallDirectory`) - от последнего запущенного установщика, фоновое обновление его не меняет, всю работу делает скрипт текущей версии.
  - `RunConfigureObs` читает версию из `{app}\current-version.js` (только цифры и точки), запускает `{app}\versions\<версия>\configure-obs.ps1` и явно передаёт `-InstallDirectory {app}`: по папке установки скрипт находит `install-manifest.json` и адреса панели и моста. Нет версии или её скрипта - запускает копию из корня.
  - Что убрать из OBS и какие данные стереть, решает текущая версия; следующие версии могут добавлять свои файлы в список `RemoveData`.
  - Установки установщика до 0.7.0 запускают корневой `configure-obs.ps1` своего установщика, пока не запустят новый; у поставленных установщиком 0.5.x удаление оставляет журнал и `healthy-process.txt` (в их списке этих файлов нет).
- **Порядок удаления:**
  - `InitializeUninstall` проверяет `-Mode Check`, открыт ли OBS: окно «закройте OBS и повторите попытку» по кругу; отказ - вопрос «удалить только файлы?», «нет» отменяет удаление. Он идёт раньше вопроса Inno «удалить?», и «нет» там оставило бы программу без панели и моста в OBS.
  - На `usUninstall` (после вопроса Inno и до удаления файлов) `-Mode Uninstall` убирает панель и мост (`RemoveFromObs`), следом `-Mode RemoveData` (`RemoveProgramData`, и при «удалить только файлы»), пока скрипт версии ещё на месте.
  - Ошибка или OBS, открытый между вопросом и удалением, - окно с ручной инструкцией и путём к журналу. Код `3` (нет `global.ini` и `user.ini`: OBS не запускали или настройки стёрты) - успех, убирать нечего.
  - `basic.ini` профиля, который не читается как UTF-8, удаление пропускает с записью в журнал, панель и мост всё равно убирает; нечитаемый `global.ini` - `4`, ничего не меняя.
  - Тихое удаление (`/VERYSILENT /SUPPRESSMSGBOXES`) при открытом OBS ответов не ждёт: окна получают ответы по умолчанию («отмена», затем «нет»), и удаление молча отменяется, ничего не тронув (решение пользователя). Поэтому скрипт перед ним закрывает OBS.
