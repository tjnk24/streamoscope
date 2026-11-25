---
paths:
  - "docs/release-notes/**"
  - ".github/workflows/**"
  - "scripts/packageRelease/**"
  - "config/compatibility.json"
  - "installer/updater/**"
  - "obs-script/streamoscope-bridge.lua"
---

# Выпуски, своё

Общее - `.claude/rules/common/tooling/releases.md`.

## Версии

- **Номер**: major - ещё несовместимый мост и выше минимальная версия OBS; minor - ещё площадка, язык, карточка.
- **Метка сборки**: стенд собирает копию без `.git`, поэтому у него `unknown`. Подписывает выпуск тоже CI.
  - Номер версии сравнивают обновлятор, мост и загрузчики: суффикс задел бы форматы из обещаний ниже, а Inno Setup требует цифры в `VersionInfoVersion`.
  - Метка видна строкой под версией в настройках, версией в диагностике, `build=` в строке журнала `started`, в имени и заголовках установщика (`docs/internals/installer.md`).
- **Версия моста - целое `BRIDGE_VERSION` в `obs-script/streamoscope-bridge/consts.lua`** (в JSON - `bridgeVersion`). Повышается, только когда меняется формат данных или панель начинает рассчитывать на новое поле. Смена коллекции сцен перезагружает скрипты, и новый мост может встретить открытую старую панель: данные моста только дополняем.
- **Требования к окружению - `config/compatibility.json`** (минимальные OBS и Chromium); подняли требование - правим его в том же изменении. Остальное `scripts/packageRelease` берёт из кода: RPC - `OBS_RPC_VERSION`, мост - `BRIDGE_VERSION`, запросы - `ObsRequestTypeEnum`.

## Сборка и публикация

- **`npm run package:release`**: production-сборка (имена с хэшем содержимого, чтобы OBS не взял старое из кэша) и `release/streamoscope-<версия>/` с `dock/`, мостом, `updater/`, `configure-obs.ps1` с `ConfigureObs/` (её запускает деинсталлятор), `LICENSE`, `README.txt`, `compatibility.json`. `release` в git не попадает.
  - Шаги `scripts/packageRelease` - `buildCompatibility` (помощники `readNumberFromSource`, `readRequiredRequests`, `readSourceFile` - в его папке), `copyReleaseFiles`, `writeReadme`, `writeCompatibility`.
  - `README.txt` - шаблон `README.template.txt` с `{{version}}`.
- **`npm run package:portable`** после `package:release` или `package:installer`: `release/streamoscope-portable-<версия>/` - раскладка установки с `minisign.exe` для ручной установки, которая обновляется сама (`docs/internals/installer.md`, «Портативная установка»).
- **Заметки выпуска - английский, после `---` русский.** После публикации обе ссылки на скачивание в README (кнопка **Download** и **Download the latest version** в первом шаге установки) переводятся на установщик нового выпуска (`releases/download/v<версия>/streamoscope-setup-<версия>.exe`), коммит и пуш - частью выпуска (решение пользователя: кнопка всегда сразу скачивает свежую версию; раньше публикации ссылка вела бы в никуда).
- **`.github/workflows/release.yml`**:
  - `build` - на Windows: `npm test`, Pester 5, Inno Setup (нет - через choco), `npm run package:installer`, `npm run package:portable`;
  - `publish` - на Linux; обновления доходят до людей без кликов, поэтому подтверждение - последняя проверка человеком. Собирает оба zip, подписывает minisign установщик, оба zip и `compatibility.json`, проверяет подписи ключом `minisign.pub`, подтверждает происхождение тех же четырёх файлов. Аттестация хранится в GitHub, проверка - `--repo tjnk24/streamoscope`; у выпусков до 0.15.1 включительно аттестаций нет, у портативного архива - с выпуска, где он появился;
  - в конец заметок дописывается скрытая строка `<!-- compatibility: {...} -->` с `compatibility.json`: панель читает её через API GitHub, файлы выпуска странице `file://` недоступны (у `release-assets.githubusercontent.com` нет CORS).
- **`.github/workflows/ci.yml`**: `npm test` и `package:release` на Linux, e2e панели (`npm run test:e2e`, Docker) на Linux, Pester установщика и моста на Windows.
- **Срочное исправление - временная ветка от тега**, постоянной ветки `release` нет (решение пользователя).
  - Если в `main` есть невыпущенное: `git switch -c hotfix/X.Y.Z vX.Y.(Z-1)`, исправление и `docs/release-notes/X.Y.Z.md`, `npm version patch`; пуш `git push --follow-tags -u origin hotfix/X.Y.Z` - только по просьбе. `release.yml` идёт от тега в любой ветке со всеми тестами, `ci.yml` на такую ветку не срабатывает. Потом ветку сливаем в `main` и удаляем.
  - Чиним только последнюю вышедшую линию: «последний выпуск» GitHub - опубликованный последним, по нему работают панель, обновлятор и страница выпусков (0.6.2 после 0.7.0 вернул бы новые установки на 0.6). Для старой линии нужен `--latest=false` в `gh release create`, в `release.yml` его нет.

## Что обновляет только установщик

- Вне `versions\`: заглушку `installer/loader/streamoscope-bridge.lua`, загрузчик панели `installer/loader/index.html`, код деинсталлятора в `installer/streamoscope.iss` (`[Code]`, `[UninstallDelete]`, тексты окон), запасной `configure-obs.ps1` с `ConfigureObs/` в корне, `minisign.exe`, иконку. Фоновое обновление их не трогает.
- У портативной установки то же самое лежит вне `versions\` и меняется, только когда человек распакует новый портативный архив поверх старого.
- Выпуск меняет что-то из этого или кладёт новое вне `versions\` - в заметках обязателен блок «запустите установщик один раз»: первым, выделенным, на обоих языках - что изменится, где взять установщик, что настройки не потеряются, а портативной установке - распаковать новый портативный архив поверх старого. Панель сама просит об этом, только пока заглушки нет (`isInstallerNeeded`: мост не отдаёт `stubVersion`).

## Обещания старым версиям - навсегда

Обновление выполняет уже установленная версия, поэтому самую новую должна уметь поставить любая, начиная с 0.3.0. Никогда не меняем:

- формат `current-version.js`, `update-trial.txt`, `healthy-version.txt`, `rolled-back-version.txt`, `healthy-loader.txt` (их читают заглушка и загрузчики старых версий, которые обновляет только установщик);
- путь загрузчика версии `versions/<версия>/streamoscope-bridge.lua` и саму заглушку (меняется только ломающим выпуском);
- верхнюю папку `streamoscope-<версия>` и обязательные файлы (`RequiredPackageFiles`) в архиве выпуска;
- формат тега `vX.Y.Z` и имена файлов выпуска: `streamoscope-setup-<версия>.exe`, `streamoscope-<версия>.zip`, `compatibility.json` и их `.minisig`;
- адрес выпусков `https://github.com/tjnk24/streamoscope/releases/download/v<версия>/`;
- ключ подписи (`minisign.pub`);
- строку `<!-- compatibility: {...} -->` в конце заметок;
- формат команды мосту `install:X.Y.Z`.

Ещё:

- Поля только добавляем - в `compatibility.json` и в строке совместимости.
- Установщик продолжаем выпускать: версии до 0.5.0 обновляются только через него, и он сам раскладывает папку установки по-новому.
- Портативный архив `streamoscope-portable-<версия>.zip` обновлятор не скачивает, он только для людей. Имя и раскладку всё равно не меняем: на них ссылается README, и его распаковывают поверх прежней портативной установки.
- Ломающий выпуск - например, если ключ скомпрометирован. Так было в 0.3.0 (переименование obs-stats-widget в StreamoScope): 0.1.0-0.2.0 ищут старые имена и сами не обновятся; переноса со старой установки нет.

## Ключ подписи

- Публичный - `minisign.pub` в корне, секретный - в секрете репозитория `MINISIGN_SECRET_KEY`, без пароля.
