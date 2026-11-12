---
paths:
  - "docs/release-notes/**"
  - ".github/workflows/**"
  - "scripts/packageRelease/**"
  - "config/compatibility.json"
  - "installer/updater/**"
  - "obs-script/streamoscope-bridge.lua"
---

# Выпуски

## Версии

- **Версия - semver, источник - `version` в `package.json`** (в панели - `process.env.APP_VERSION`). Номер - по самому крупному изменению:
  - **major** - ломает установку или настройки: ручные действия, несовместимый мост, выше минимальная версия OBS;
  - **minor** - новая возможность: функция, настройка, площадка, язык, карточка;
  - **patch** - исправления и косметика: иконки, стили, тексты, переводы.
  - Пока 0.x, ломающее изменение идёт в minor и обязательно описывается в заметках. 1.0.0 - когда несколько выпусков подряд ничего не ломали и установка с обновлением устоялись.
- **Метка сборки - `webpack/init/getBuildLabel`**: пустая только у сборки `release.yml` по тегу (`GITHUB_REF_TYPE=tag`), у остальных - `git describe --tags --always --dirty --match v*` (`v0.6.0-5-g4420f14-dirty`), вне git - `unknown` (стенд собирает копию без `.git`). Выпуск - только то, что собрал и подписал CI, поэтому метку получает и локальная сборка с коммита выпуска.
  - Номер версии у таких сборок прежний (решение пользователя): по нему сравнивают обновлятор, мост и загрузчики, суффикс задел бы форматы из обещаний ниже, а Inno Setup требует цифры в `VersionInfoVersion`.
  - Метка только для глаз: `process.env.BUILD_LABEL` (`defineGlobals`) - строка под версией в настройках, версия в диагностике, `build=` в строке журнала `started`, имя и заголовки установщика (`docs/internals/installer.md`).
- **Версия моста - целое `BRIDGE_VERSION` в `obs-script/streamoscope-bridge/consts.lua`** (в JSON - `bridgeVersion`). Повышается, только когда меняется формат данных или панель начинает рассчитывать на новое поле. Смена коллекции сцен перезагружает скрипты, и новый мост может встретить открытую старую панель: данные моста только дополняем.
- **Требования к окружению - `config/compatibility.json`** (минимальные OBS и Chromium); подняли требование - правим его в том же изменении. Остальное `scripts/packageRelease` берёт из кода: RPC - `OBS_RPC_VERSION`, мост - `BRIDGE_VERSION`, запросы - `ObsRequestTypeEnum`.

## Сборка и публикация

- **`npm run package:release`**: production-сборка (имена с хэшем содержимого, чтобы OBS не взял старое из кэша) и `release/streamoscope-<версия>/` с `dock/`, мостом, `updater/`, `configure-obs.ps1` с `ConfigureObs/` (её запускает деинсталлятор), `LICENSE`, `README.txt`, `compatibility.json`. `release` в git не попадает.
  - `scripts/packageRelease/index.ts` только перечисляет шаги, шаг - своя функция в своём файле (`buildCompatibility`, `copyReleaseFiles`, `writeReadme`, `writeCompatibility`), помощники шага - в его папке (`buildCompatibility/` с `readNumberFromSource`, `readRequiredRequests`, `readSourceFile` и реэкспортом в `index.ts`).
  - `README.txt` - шаблон `README.template.txt` с `{{version}}`.
- **Как выпустить**: заметки `docs/release-notes/<версия>.md` (английский, после `---` русский), `npm version <major|minor|patch>` (коммит и тег `v<версия>`), `git push --follow-tags` - только по просьбе.
- **`.github/workflows/release.yml`** по тегу, два задания:
  - `build` (Windows): тег совпадает с `package.json`, заметки есть, `npm test`, Pester 5, Inno Setup (нет - через choco), `npm run package:installer`, всё из `release/` - в артефакт;
  - `publish` (Linux), только для тега и после ручного подтверждения (окружение `release`: подтверждает владелец, только теги `v*`) - обновления доходят до людей без кликов, это последняя проверка человеком. Собирает zip, подписывает minisign установщик, zip и `compatibility.json`, проверяет подписи ключом `minisign.pub`, пишет `SHA256SUMS.txt`, создаёт GitHub Release. Секретный ключ есть только у `publish`;
  - в конец заметок дописывается скрытая строка `<!-- compatibility: {...} -->` с `compatibility.json`: панель читает её через API GitHub, файлы выпуска странице `file://` недоступны (у `release-assets.githubusercontent.com` нет CORS);
  - вручную (`workflow_dispatch`, `gh workflow run release.yml`) - только `build`, без выпуска.
- **`.github/workflows/ci.yml`** на пуш в `main` и pull request: `npm test` и `package:release` на Linux, Pester установщика и моста на Windows. Действия GitHub (`actions/checkout` и другие) - на последних мажорных версиях.
- **Срочное исправление - временная ветка от тега**, постоянной ветки `release` нет (решение пользователя).
  - Если в `main` есть невыпущенное: `git switch -c hotfix/X.Y.Z vX.Y.(Z-1)`, исправление и `docs/release-notes/X.Y.Z.md`, `npm version patch`; пуш `git push --follow-tags -u origin hotfix/X.Y.Z` - только по просьбе. `release.yml` идёт от тега в любой ветке со всеми тестами, `ci.yml` на такую ветку не срабатывает. Потом ветку сливаем в `main` и удаляем.
  - Чиним только последнюю вышедшую линию: «последний выпуск» GitHub - опубликованный последним, по нему работают панель, обновлятор и страница выпусков (0.6.2 после 0.7.0 вернул бы новые установки на 0.6). Для старой линии нужен `--latest=false` в `gh release create`, в `release.yml` его нет.

## Что обновляет только установщик

- Вне `versions\`: заглушку `installer/loader/streamoscope-bridge.lua`, загрузчик панели `installer/loader/index.html`, код деинсталлятора в `installer/streamoscope.iss` (`[Code]`, `[UninstallDelete]`, тексты окон), запасной `configure-obs.ps1` с `ConfigureObs/` в корне, `minisign.exe`, иконку. Фоновое обновление их не трогает.
- Выпуск меняет что-то из этого или кладёт новое вне `versions\` - в заметках обязателен блок «запустите установщик один раз»: первым, выделенным, на обоих языках - что изменится, где взять установщик, что настройки не потеряются. Панель сама просит об этом, только пока заглушки нет (`isInstallerNeeded`: мост не отдаёт `stubVersion`).

## Обещания старым версиям - навсегда

Обновление выполняет уже установленная версия, поэтому любая старая, начиная с 0.3.0, должна уметь поставить самую новую. Никогда не меняем:

- формат `current-version.js`, `update-trial.txt`, `healthy-version.txt`, `rolled-back-version.txt`, `healthy-loader.txt` (их читают заглушка и загрузчики старых версий, которые обновляет только установщик);
- путь загрузчика версии `versions/<версия>/streamoscope-bridge.lua` и саму заглушку (меняется только ломающим выпуском);
- верхнюю папку `streamoscope-<версия>` и обязательные файлы (`RequiredPackageFiles`) в архиве выпуска;
- формат тега `vX.Y.Z` и имена файлов выпуска: `streamoscope-setup-<версия>.exe`, `streamoscope-<версия>.zip`, `compatibility.json` и их `.minisig`;
- адрес выпусков `https://github.com/tjnk24/streamoscope/releases/download/v<версия>/`;
- ключ подписи (`minisign.pub`);
- строку `<!-- compatibility: {...} -->` в конце заметок;
- формат команды мосту `install:X.Y.Z`.

Ещё:

- В `compatibility.json` и строку совместимости поля только добавляем, существующие не удаляем и не переименовываем.
- Установщик продолжаем выпускать: версии до 0.5.0 обновляются только через него, и он сам раскладывает папку установки по-новому.
- Без смены чего-то из списка не обойтись (например, ключ скомпрометирован) - это ломающий выпуск: старые версии обновятся только вручную, это пишется в заметках. Так было в 0.3.0 (переименование obs-stats-widget в StreamoScope): 0.1.0-0.2.0 ищут старые имена и сами не обновятся; переноса со старой установки нет.

## Ключ подписи

- Публичный - `minisign.pub` в корне, секретный - только в секрете репозитория `MINISIGN_SECRET_KEY`, без пароля. Секретный ключ не читаем, не выводим и в репозиторий не кладём.
