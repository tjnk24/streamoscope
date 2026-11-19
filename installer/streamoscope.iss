#ifndef AppVersion
  #error AppVersion is not defined, build with npm run package:installer
#endif

#ifndef SetupName
  #error SetupName is not defined, build with npm run package:installer
#endif

#ifdef BuildLabel
  #define BuildSuffix " (local build " + BuildLabel + ")"
#else
  #define BuildSuffix ""
#endif

#ifndef PackageDir
  #error PackageDir is not defined, build with npm run package:installer
#endif

#ifndef MinisignPath
  #error MinisignPath is not defined, build with npm run package:installer
#endif

#ifndef OutputDir
  #define OutputDir "..\release"
#endif

#define AppName "StreamoScope"
#define AppSlug "streamoscope"
#define AppUrl "https://github.com/tjnk24/streamoscope"
#define SetupMutexName "streamoscope-setup"

[Setup]
AppId={{6D39D358-2386-4437-8FE3-CF5511816FD1}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}{#BuildSuffix}
AppPublisher=tjnk24
AppPublisherURL={#AppUrl}
AppSupportURL={#AppUrl}/issues
AppUpdatesURL={#AppUrl}/releases
DefaultDirName={autopf}\{#AppSlug}
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir={#OutputDir}
OutputBaseFilename={#SetupName}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
SetupIconFile=images\streamoscope.ico
WizardImageFile=images\wizard-164.png,images\wizard-246.png,images\wizard-328.png
WizardSmallImageFile=images\wizard-small-55.png,images\wizard-small-83.png,images\wizard-small-110.png
UninstallDisplayIcon={app}\streamoscope.ico
CloseApplications=no
SetupMutex={#SetupMutexName}
UninstallDisplayName={#AppName}{#BuildSuffix}
VersionInfoVersion={#AppVersion}
VersionInfoProductName={#AppName}

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "ru"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "de"; MessagesFile: "compiler:Languages\German.isl"
Name: "ptbr"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "uk"; MessagesFile: "compiler:Languages\Ukrainian.isl"
Name: "pl"; MessagesFile: "compiler:Languages\Polish.isl"
Name: "fr"; MessagesFile: "compiler:Languages\French.isl"
Name: "ko"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "ja"; MessagesFile: "compiler:Languages\Japanese.isl"
Name: "it"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "nl"; MessagesFile: "compiler:Languages\Dutch.isl"
Name: "tr"; MessagesFile: "compiler:Languages\Turkish.isl"
Name: "th"; MessagesFile: "compiler:Languages\Thai.isl"

[InstallDelete]
Type: filesandordirs; Name: "{app}\dock"
Type: filesandordirs; Name: "{app}\versions"
Type: filesandordirs; Name: "{app}\streamoscope-bridge"
Type: filesandordirs; Name: "{app}\ConfigureObs"
Type: filesandordirs; Name: "{app}\updater"
Type: files; Name: "{app}\compatibility.json"
Type: files; Name: "{app}\LICENSE"
Type: files; Name: "{app}\update-trial.txt"
Type: files; Name: "{app}\rolled-back-version.txt"
Type: files; Name: "{localappdata}\streamoscope\update-status.json"
Type: files; Name: "{localappdata}\streamoscope\update-check.stamp"

[UninstallDelete]
Type: filesandordirs; Name: "{localappdata}\streamoscope\logs"
Type: files; Name: "{localappdata}\streamoscope\journal.txt"
Type: files; Name: "{localappdata}\streamoscope\auto-update.txt"
Type: files; Name: "{localappdata}\streamoscope\update-status.json"
Type: files; Name: "{localappdata}\streamoscope\update-status.json.lock"
Type: files; Name: "{localappdata}\streamoscope\update-check.stamp"
Type: filesandordirs; Name: "{app}\versions"
Type: filesandordirs; Name: "{app}\dock"
Type: filesandordirs; Name: "{app}\streamoscope-bridge"
Type: filesandordirs; Name: "{app}\ConfigureObs"
Type: filesandordirs; Name: "{app}\updater"
Type: files; Name: "{app}\install-manifest.json"
Type: files; Name: "{app}\current-version.js"
Type: files; Name: "{app}\update-trial.txt"
Type: files; Name: "{app}\healthy-version.txt"
Type: files; Name: "{app}\healthy-process.txt"
Type: files; Name: "{app}\healthy-loader.txt"
Type: files; Name: "{app}\rolled-back-version.txt"

[Files]
Source: "{#PackageDir}\*"; DestDir: "{app}\versions\{#AppVersion}"; Excludes: "README.txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "loader\streamoscope-bridge.lua"; DestDir: "{app}"; Flags: ignoreversion
Source: "loader\index.html"; DestDir: "{app}\dock"; Flags: ignoreversion
Source: "configure-obs.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "images\streamoscope.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "ConfigureObs\*.ps1"; DestDir: "{app}\ConfigureObs"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#MinisignPath}"; DestDir: "{app}\updater"; Flags: ignoreversion
Source: "third-party\minisign-LICENSE.txt"; DestDir: "{app}\updater"; Flags: ignoreversion

[Messages]
en.SetupAppRunningError=StreamoScope is already being installed or removed in another window. Wait for it to finish and try again.%n%nIf you cancel, this setup closes.
ru.SetupAppRunningError=StreamoScope уже устанавливается или удаляется в другом окне. Дождитесь окончания и повторите попытку.%n%nЕсли отменить, эта установка закроется.
es.SetupAppRunningError=StreamoScope ya se está instalando o desinstalando en otra ventana. Espere a que termine y vuelva a intentarlo.%n%nSi cancela, este instalador se cerrará.
de.SetupAppRunningError=StreamoScope wird bereits in einem anderen Fenster installiert oder entfernt. Warten Sie, bis der Vorgang abgeschlossen ist, und versuchen Sie es erneut.%n%nBeim Abbrechen wird dieses Setup beendet.
ptbr.SetupAppRunningError=O StreamoScope já está sendo instalado ou removido em outra janela. Aguarde a conclusão e tente novamente.%n%nSe cancelar, este instalador será fechado.
uk.SetupAppRunningError=StreamoScope вже встановлюється або видаляється в іншому вікні. Дочекайтеся завершення і повторіть спробу.%n%nЯкщо скасувати, це встановлення закриється.
pl.SetupAppRunningError=StreamoScope jest już instalowany lub usuwany w innym oknie. Poczekaj, aż skończy, i spróbuj ponownie.%n%nJeśli anulujesz, ten instalator się zamknie.
fr.SetupAppRunningError=StreamoScope est déjà en cours d'installation ou de suppression dans une autre fenêtre. Attendez la fin et réessayez.%n%nSi vous annulez, cet installateur se ferme.
ko.SetupAppRunningError=다른 창에서 StreamoScope를 이미 설치하거나 제거하고 있습니다. 끝날 때까지 기다린 뒤 다시 시도하세요.%n%n취소하면 이 설치 프로그램이 닫힙니다.
ja.SetupAppRunningError=StreamoScopeは別のウィンドウでインストールまたはアンインストール中です。終わるまで待ってから、もう一度試してください。%n%nキャンセルすると、このセットアップは終了します。
it.SetupAppRunningError=StreamoScope è già in fase di installazione o rimozione in un'altra finestra. Aspetta che finisca e riprova.%n%nSe annulli, questa installazione si chiude.
nl.SetupAppRunningError=StreamoScope wordt al in een ander venster geïnstalleerd of verwijderd. Wacht tot dat klaar is en probeer het opnieuw.%n%nAls je annuleert, sluit deze installatie.
tr.SetupAppRunningError=StreamoScope başka bir pencerede zaten kuruluyor ya da kaldırılıyor. Bitmesini bekleyip yeniden deneyin.%n%nİptal ederseniz bu kurulum kapanır.
th.SetupAppRunningError=StreamoScope กำลังติดตั้งหรือถอนการติดตั้งอยู่ในหน้าต่างอื่น รอให้เสร็จแล้วลองอีกครั้ง%n%nถ้ายกเลิก การติดตั้งนี้จะปิดลง

[CustomMessages]
en.ConfiguringObs=Setting up OBS...
en.ObsRunning=OBS is running. Close OBS and try again.%n%nIf you cancel, setup finishes without setting up OBS.
en.SetupSkipped=The dock and the script were not added to OBS. Close OBS and run this setup again, or add them by hand as described in the guide:
en.ObsNotStarted=OBS has not been started on this computer yet. Start OBS once, close it and run this setup again.
en.SetupFailed=The dock and the script could not be added to OBS automatically, and nothing was changed in it. Add them by hand as described in the guide:
en.SetupStopped=Setting up OBS took too long and was stopped. Run this setup again, or add the dock and the script by hand as described in the guide:
en.ScriptSlow=Setting up OBS is taking longer than usual. Keep waiting?%n%nIf not, setting up OBS stops.
en.WebSocketNotConfigured=Turn on the WebSocket server: Tools → WebSocket Server Settings → Enable WebSocket server.
en.FinishedHowTo=Start OBS and open Docks → StreamoScope. On first start the dock asks for the WebSocket password: Tools → WebSocket Server Settings → Show Connect Info.
en.UninstallObsRunning=OBS is running. Close OBS and try again, so that the dock and the script are removed from OBS too.
en.UninstallSetupRunning=StreamoScope setup is running. Wait for it to finish and try again.
en.UninstallFilesOnly=Delete only the files and leave the dock and the script in the OBS settings?
en.UninstallFailed=The dock and the script could not be removed from OBS automatically. Remove the dock in Docks and the script in Tools → Scripts.
en.Details=Details:

ru.ConfiguringObs=Настройка OBS...
ru.ObsRunning=OBS запущен. Закройте OBS и повторите попытку.%n%nЕсли отменить, установка завершится без настройки OBS.
ru.SetupSkipped=Панель и скрипт не добавлены в OBS. Закройте OBS и запустите установку ещё раз или добавьте их вручную по инструкции:
ru.ObsNotStarted=OBS на этом компьютере ещё ни разу не запускался. Запустите OBS один раз, закройте его и запустите установку ещё раз.
ru.SetupFailed=Не удалось добавить панель и скрипт в OBS автоматически, в нём ничего не изменено. Добавьте их вручную по инструкции:
ru.SetupStopped=Настройка OBS шла слишком долго и была прервана. Запустите установку ещё раз или добавьте панель и скрипт вручную по инструкции:
ru.ScriptSlow=Настройка OBS идёт дольше обычного. Подождать ещё?%n%nЕсли нет, настройка остановится.
ru.WebSocketNotConfigured=Включите сервер WebSocket: Сервис → Настройки сервера WebSocket → Включить сервер WebSocket.
ru.FinishedHowTo=Запустите OBS и откройте Док-панели → StreamoScope. При первом запуске панель попросит пароль WebSocket: Сервис → Настройки сервера WebSocket → Показать сведения о подключении.
ru.UninstallObsRunning=OBS запущен. Закройте OBS и повторите попытку, чтобы панель и скрипт убрались и из OBS.
ru.UninstallSetupRunning=Идёт установка StreamoScope. Дождитесь её окончания и повторите попытку.
ru.UninstallFilesOnly=Удалить только файлы, а панель и скрипт оставить в настройках OBS?
ru.UninstallFailed=Не удалось убрать панель и скрипт из OBS автоматически. Удалите панель в меню Док-панели, а скрипт — в Сервис → Скрипты.
ru.Details=Подробности:

es.ConfiguringObs=Configurando OBS...
es.ObsRunning=OBS está abierto. Cierre OBS y vuelva a intentarlo.%n%nSi cancela, la instalación terminará sin configurar OBS.
es.SetupSkipped=El panel y el script no se han añadido a OBS. Cierre OBS y vuelva a ejecutar el instalador, o añádalos a mano según la guía:
es.ObsNotStarted=OBS aún no se ha abierto en este equipo. Abra OBS una vez, ciérrelo y vuelva a ejecutar el instalador.
es.SetupFailed=No se pudieron añadir el panel y el script a OBS automáticamente, y no se ha cambiado nada en él. Añádalos a mano según la guía:
es.SetupStopped=La configuración de OBS tardó demasiado y se detuvo. Vuelva a ejecutar el instalador, o añada el panel y el script a mano según la guía:
es.ScriptSlow=La configuración de OBS está tardando más de lo habitual. ¿Seguir esperando?%n%nSi no, la configuración se detendrá.
es.WebSocketNotConfigured=Active el servidor WebSocket: Herramientas → Ajustes del servidor WebSocket → Habilitar servidor WebSocket.
es.FinishedHowTo=Abra OBS y elija Paneles → StreamoScope. La primera vez el panel pedirá la contraseña de WebSocket: Herramientas → Ajustes del servidor WebSocket → Mostrar información de conexión.
es.UninstallObsRunning=OBS está abierto. Cierre OBS y vuelva a intentarlo para quitar también el panel y el script de OBS.
es.UninstallSetupRunning=La instalación de StreamoScope está en curso. Espere a que termine y vuelva a intentarlo.
es.UninstallFilesOnly=¿Eliminar solo los archivos y dejar el panel y el script en la configuración de OBS?
es.UninstallFailed=No se pudieron quitar el panel y el script de OBS automáticamente. Quite el panel en Paneles y el script en Herramientas → Scripts.
es.Details=Detalles:

de.ConfiguringObs=OBS wird eingerichtet...
de.ObsRunning=OBS ist geöffnet. Schließen Sie OBS und versuchen Sie es erneut.%n%nBeim Abbrechen wird das Setup ohne Einrichtung von OBS beendet.
de.SetupSkipped=Dock und Skript wurden nicht zu OBS hinzugefügt. Schließen Sie OBS und starten Sie das Setup erneut, oder fügen Sie sie laut Anleitung von Hand hinzu:
de.ObsNotStarted=OBS wurde auf diesem Computer noch nie gestartet. Starten Sie OBS einmal, schließen Sie es und starten Sie das Setup erneut.
de.SetupFailed=Dock und Skript konnten nicht automatisch zu OBS hinzugefügt werden, es wurde nichts daran geändert. Fügen Sie sie laut Anleitung von Hand hinzu:
de.SetupStopped=Die Einrichtung von OBS hat zu lange gedauert und wurde abgebrochen. Starten Sie das Setup erneut, oder fügen Sie Dock und Skript laut Anleitung von Hand hinzu:
de.ScriptSlow=Das Einrichten von OBS dauert länger als üblich. Weiter warten?%n%nAndernfalls wird das Einrichten abgebrochen.
de.WebSocketNotConfigured=Aktivieren Sie den WebSocket-Server: Werkzeuge → WebSocket-Servereinstellungen → WebSocket-Server aktivieren.
de.FinishedHowTo=Starten Sie OBS und öffnen Sie Docks → StreamoScope. Beim ersten Start fragt das Dock nach dem WebSocket-Passwort: Werkzeuge → WebSocket-Servereinstellungen → Verbindungsinformationen anzeigen.
de.UninstallObsRunning=OBS ist geöffnet. Schließen Sie OBS und versuchen Sie es erneut, damit Dock und Skript auch aus OBS entfernt werden.
de.UninstallSetupRunning=Das Setup von StreamoScope läuft gerade. Warten Sie, bis es abgeschlossen ist, und versuchen Sie es erneut.
de.UninstallFilesOnly=Nur die Dateien löschen und Dock und Skript in den OBS-Einstellungen lassen?
de.UninstallFailed=Dock und Skript konnten nicht automatisch aus OBS entfernt werden. Entfernen Sie das Dock unter Docks und das Skript unter Werkzeuge → Skripte.
de.Details=Details:

ptbr.ConfiguringObs=Configurando o OBS...
ptbr.ObsRunning=O OBS está aberto. Feche o OBS e tente novamente.%n%nSe cancelar, a instalação terminará sem configurar o OBS.
ptbr.SetupSkipped=O painel e o script não foram adicionados ao OBS. Feche o OBS e execute o instalador novamente, ou adicione-os manualmente seguindo o guia:
ptbr.ObsNotStarted=O OBS ainda não foi aberto neste computador. Abra o OBS uma vez, feche-o e execute o instalador novamente.
ptbr.SetupFailed=Não foi possível adicionar o painel e o script ao OBS automaticamente, e nada foi alterado nele. Adicione-os manualmente seguindo o guia:
ptbr.SetupStopped=A configuração do OBS demorou demais e foi interrompida. Execute o instalador novamente, ou adicione o painel e o script manualmente seguindo o guia:
ptbr.ScriptSlow=A configuração do OBS está demorando mais do que o normal. Continuar esperando?%n%nSe não, ela será interrompida.
ptbr.WebSocketNotConfigured=Ative o servidor WebSocket: Ferramentas → Configurações do servidor WebSocket → Ativar servidor WebSocket.
ptbr.FinishedHowTo=Abra o OBS e escolha Painéis → StreamoScope. Na primeira vez o painel pedirá a senha do WebSocket: Ferramentas → Configurações do servidor WebSocket → Mostrar informações da conexão.
ptbr.UninstallObsRunning=O OBS está aberto. Feche o OBS e tente novamente para remover também o painel e o script do OBS.
ptbr.UninstallSetupRunning=A instalação do StreamoScope está em andamento. Aguarde a conclusão e tente novamente.
ptbr.UninstallFilesOnly=Excluir apenas os arquivos e deixar o painel e o script nas configurações do OBS?
ptbr.UninstallFailed=Não foi possível remover o painel e o script do OBS automaticamente. Remova o painel em Painéis e o script em Ferramentas → Scripts.
ptbr.Details=Detalhes:

uk.ConfiguringObs=Налаштування OBS...
uk.ObsRunning=OBS запущено. Закрийте OBS і повторіть спробу.%n%nЯкщо скасувати, встановлення завершиться без налаштування OBS.
uk.SetupSkipped=Панель і скрипт не додано в OBS. Закрийте OBS і запустіть встановлення ще раз або додайте їх вручну за інструкцією:
uk.ObsNotStarted=OBS на цьому комп'ютері ще жодного разу не запускався. Запустіть OBS один раз, закрийте його і запустіть встановлення ще раз.
uk.SetupFailed=Не вдалося додати панель і скрипт в OBS автоматично, у ньому нічого не змінено. Додайте їх вручну за інструкцією:
uk.SetupStopped=Налаштування OBS тривало надто довго і було перерване. Запустіть встановлення ще раз або додайте панель і скрипт вручну за інструкцією:
uk.ScriptSlow=Налаштування OBS триває довше, ніж зазвичай. Почекати ще?%n%nЯкщо ні, налаштування зупиниться.
uk.WebSocketNotConfigured=Увімкніть сервер WebSocket: Інструменти → Налаштування WebSocket сервера → Увімкнути сервер WebSocket.
uk.FinishedHowTo=Запустіть OBS і відкрийте Панелі інтерфейсу → StreamoScope. Під час першого запуску панель попросить пароль WebSocket: Інструменти → Налаштування WebSocket сервера → Показати відомості про з'єднання.
uk.UninstallObsRunning=OBS запущено. Закрийте OBS і повторіть спробу, щоб панель і скрипт прибралися і з OBS.
uk.UninstallSetupRunning=Іде встановлення StreamoScope. Дочекайтеся його завершення і повторіть спробу.
uk.UninstallFilesOnly=Видалити лише файли, а панель і скрипт залишити в налаштуваннях OBS?
uk.UninstallFailed=Не вдалося прибрати панель і скрипт з OBS автоматично. Видаліть панель у меню Панелі інтерфейсу, а скрипт — в Інструменти → Скрипти.
uk.Details=Подробиці:

pl.ConfiguringObs=Konfigurowanie OBS...
pl.ObsRunning=OBS jest uruchomiony. Zamknij OBS i spróbuj ponownie.%n%nJeśli anulujesz, instalacja zakończy się bez konfiguracji OBS.
pl.SetupSkipped=Panel i skrypt nie zostały dodane do OBS. Zamknij OBS i uruchom instalator ponownie albo dodaj je ręcznie według instrukcji:
pl.ObsNotStarted=OBS nie był jeszcze uruchamiany na tym komputerze. Uruchom OBS raz, zamknij go i uruchom instalator ponownie.
pl.SetupFailed=Nie udało się automatycznie dodać panelu i skryptu do OBS, nic w nim nie zmieniono. Dodaj je ręcznie według instrukcji:
pl.SetupStopped=Konfiguracja OBS trwała za długo i została przerwana. Uruchom instalator ponownie albo dodaj panel i skrypt ręcznie według instrukcji:
pl.ScriptSlow=Konfiguracja OBS trwa dłużej niż zwykle. Czekać dalej?%n%nJeśli nie, konfiguracja zostanie przerwana.
pl.WebSocketNotConfigured=Włącz serwer WebSocket: Narzędzia → Ustawienia serwera WebSocket → Włącz serwer WebSocket.
pl.FinishedHowTo=Uruchom OBS i otwórz Panele → StreamoScope. Przy pierwszym uruchomieniu panel zapyta o hasło WebSocket: Narzędzia → Ustawienia serwera WebSocket → Pokaż informacje połączenia.
pl.UninstallObsRunning=OBS jest uruchomiony. Zamknij OBS i spróbuj ponownie, aby panel i skrypt zniknęły też z OBS.
pl.UninstallSetupRunning=Trwa instalacja StreamoScope. Poczekaj, aż się skończy, i spróbuj ponownie.
pl.UninstallFilesOnly=Usunąć tylko pliki, a panel i skrypt zostawić w ustawieniach OBS?
pl.UninstallFailed=Nie udało się automatycznie usunąć panelu i skryptu z OBS. Usuń panel w menu Panele, a skrypt w Narzędzia → Skrypty.
pl.Details=Szczegóły:

fr.ConfiguringObs=Configuration d'OBS...
fr.ObsRunning=OBS est ouvert. Fermez OBS et réessayez.%n%nSi vous annulez, l'installation se terminera sans configurer OBS.
fr.SetupSkipped=Le dock et le script n'ont pas été ajoutés à OBS. Fermez OBS et relancez l'installateur, ou ajoutez-les à la main en suivant le guide :
fr.ObsNotStarted=OBS n'a encore jamais été lancé sur cet ordinateur. Lancez OBS une fois, fermez-le et relancez l'installateur.
fr.SetupFailed=Impossible d'ajouter automatiquement le dock et le script à OBS, rien n'y a été modifié. Ajoutez-les à la main en suivant le guide :
fr.SetupStopped=La configuration d'OBS a pris trop de temps et a été arrêtée. Relancez l'installateur, ou ajoutez le dock et le script à la main en suivant le guide :
fr.ScriptSlow=La configuration d'OBS prend plus de temps que d'habitude. Continuer à attendre ?%n%nSinon, la configuration s'arrêtera.
fr.WebSocketNotConfigured=Activez le serveur WebSocket : Outils → Paramètres du serveur WebSocket → Activer le serveur WebSocket.
fr.FinishedHowTo=Lancez OBS et ouvrez Docks → StreamoScope. Au premier lancement, le dock demande le mot de passe WebSocket : Outils → Paramètres du serveur WebSocket → Afficher les informations de connexion.
fr.UninstallObsRunning=OBS est ouvert. Fermez OBS et réessayez, pour que le dock et le script soient aussi retirés d'OBS.
fr.UninstallSetupRunning=L'installation de StreamoScope est en cours. Attendez qu'elle se termine et réessayez.
fr.UninstallFilesOnly=Supprimer seulement les fichiers et laisser le dock et le script dans les paramètres d'OBS ?
fr.UninstallFailed=Impossible de retirer automatiquement le dock et le script d'OBS. Retirez le dock dans Docks et le script dans Outils → Scripts.
fr.Details=Détails :

ko.ConfiguringObs=OBS 설정 중...
ko.ObsRunning=OBS가 실행 중입니다. OBS를 닫고 다시 시도하세요.%n%n취소하면 OBS를 설정하지 않고 설치를 마칩니다.
ko.SetupSkipped=독과 스크립트를 OBS에 추가하지 않았습니다. OBS를 닫고 설치 프로그램을 다시 실행하거나, 안내에 따라 직접 추가하세요:
ko.ObsNotStarted=이 컴퓨터에서 OBS를 아직 한 번도 실행하지 않았습니다. OBS를 한 번 실행했다가 닫고 설치 프로그램을 다시 실행하세요.
ko.SetupFailed=독과 스크립트를 OBS에 자동으로 추가하지 못했고, OBS에서는 아무것도 바뀌지 않았습니다. 안내에 따라 직접 추가하세요:
ko.SetupStopped=OBS 설정이 너무 오래 걸려 중단했습니다. 설치 프로그램을 다시 실행하거나, 안내에 따라 독과 스크립트를 직접 추가하세요:
ko.ScriptSlow=OBS 설정이 평소보다 오래 걸리고 있습니다. 계속 기다릴까요?%n%n기다리지 않으면 설정을 중단합니다.
ko.WebSocketNotConfigured=WebSocket 서버를 켜세요: 도구 → WebSocket 서버 설정 → WebSocket 서버 사용.
ko.FinishedHowTo=OBS를 실행하고 독 → StreamoScope를 여세요. 처음 실행하면 독이 WebSocket 비밀번호를 묻습니다: 도구 → WebSocket 서버 설정 → 서버 정보 표시.
ko.UninstallObsRunning=OBS가 실행 중입니다. OBS에서도 독과 스크립트가 제거되도록 OBS를 닫고 다시 시도하세요.
ko.UninstallSetupRunning=StreamoScope 설치가 진행 중입니다. 끝날 때까지 기다린 뒤 다시 시도하세요.
ko.UninstallFilesOnly=파일만 삭제하고 독과 스크립트는 OBS 설정에 남겨 둘까요?
ko.UninstallFailed=독과 스크립트를 OBS에서 자동으로 제거하지 못했습니다. 독 메뉴에서 독을, 도구 → 스크립트에서 스크립트를 제거하세요.
ko.Details=자세한 정보:

ja.ConfiguringObs=OBSを設定しています...
ja.ObsRunning=OBSが起動しています。OBSを閉じてから、もう一度試してください。%n%nキャンセルすると、OBSを設定せずにセットアップを終了します。
ja.SetupSkipped=ドックとスクリプトはOBSに追加されていません。OBSを閉じてセットアップをもう一度実行するか、ガイドに沿って手動で追加してください:
ja.ObsNotStarted=このパソコンではOBSがまだ一度も起動されていません。OBSを一度起動して閉じてから、セットアップをもう一度実行してください。
ja.SetupFailed=ドックとスクリプトをOBSに自動で追加できませんでした。OBSには何も変更していません。ガイドに沿って手動で追加してください:
ja.SetupStopped=OBSの設定に時間がかかりすぎたため中止しました。セットアップをもう一度実行するか、ガイドに沿ってドックとスクリプトを手動で追加してください:
ja.ScriptSlow=OBSの設定にいつもより時間がかかっています。このまま待ちますか？%n%n待たない場合は、設定を中止します。
ja.WebSocketNotConfigured=WebSocketサーバーをオンにしてください: ツール → WebSocket サーバー設定 → WebSocketサーバーを有効にする
ja.FinishedHowTo=OBSを起動して、ドック → StreamoScope を開いてください。初回の起動時に、ドックがWebSocketのパスワードを尋ねます: ツール → WebSocket サーバー設定 → 接続情報を表示
ja.UninstallObsRunning=OBSが起動しています。OBSからもドックとスクリプトを取り除けるよう、OBSを閉じてからもう一度試してください。
ja.UninstallSetupRunning=StreamoScopeのセットアップを実行中です。終わるまで待ってから、もう一度試してください。
ja.UninstallFilesOnly=ファイルだけを削除し、ドックとスクリプトはOBSの設定に残しますか？
ja.UninstallFailed=ドックとスクリプトをOBSから自動で取り除けませんでした。ドックは「ドック」メニューで、スクリプトは ツール → スクリプト で削除してください。
ja.Details=詳細:

it.ConfiguringObs=Configurazione di OBS...
it.ObsRunning=OBS è aperto. Chiudi OBS e riprova.%n%nSe annulli, l'installazione termina senza configurare OBS.
it.SetupSkipped=Il pannello e lo script non sono stati aggiunti a OBS. Chiudi OBS ed esegui di nuovo l'installazione, oppure aggiungili a mano seguendo la guida:
it.ObsNotStarted=OBS non è mai stato avviato su questo computer. Avvia OBS una volta, chiudilo ed esegui di nuovo l'installazione.
it.SetupFailed=Non è stato possibile aggiungere automaticamente il pannello e lo script a OBS, e in OBS non è cambiato nulla. Aggiungili a mano seguendo la guida:
it.SetupStopped=La configurazione di OBS ci ha messo troppo ed è stata interrotta. Esegui di nuovo l'installazione, oppure aggiungi il pannello e lo script a mano seguendo la guida:
it.ScriptSlow=La configurazione di OBS ci sta mettendo più del solito. Continuare ad aspettare?%n%nAltrimenti la configurazione si interrompe.
it.WebSocketNotConfigured=Accendi il server WebSocket: Strumenti → Impostazioni server WebSocket → Abilita il server WebSocket.
it.FinishedHowTo=Avvia OBS e apri Pannelli → StreamoScope. Al primo avvio il pannello chiede la password di WebSocket: Strumenti → Impostazioni server WebSocket → Visualizza informazioni di connessione.
it.UninstallObsRunning=OBS è aperto. Chiudi OBS e riprova, così il pannello e lo script vengono tolti anche da OBS.
it.UninstallSetupRunning=L'installazione di StreamoScope è in corso. Aspetta che finisca e riprova.
it.UninstallFilesOnly=Eliminare solo i file e lasciare il pannello e lo script nelle impostazioni di OBS?
it.UninstallFailed=Non è stato possibile togliere automaticamente il pannello e lo script da OBS. Togli il pannello in Pannelli e lo script in Strumenti → Script.
it.Details=Dettagli:

nl.ConfiguringObs=OBS instellen...
nl.ObsRunning=OBS is geopend. Sluit OBS en probeer het opnieuw.%n%nAls je annuleert, rondt de installatie af zonder OBS in te stellen.
nl.SetupSkipped=Het dock en het script zijn niet aan OBS toegevoegd. Sluit OBS en voer de installatie opnieuw uit, of voeg ze met de hand toe volgens de handleiding:
nl.ObsNotStarted=OBS is op deze computer nog nooit gestart. Start OBS één keer, sluit het en voer de installatie opnieuw uit.
nl.SetupFailed=Het dock en het script konden niet automatisch aan OBS worden toegevoegd, en er is niets in OBS veranderd. Voeg ze met de hand toe volgens de handleiding:
nl.SetupStopped=Het instellen van OBS duurde te lang en is gestopt. Voer de installatie opnieuw uit, of voeg het dock en het script met de hand toe volgens de handleiding:
nl.ScriptSlow=Het instellen van OBS duurt langer dan normaal. Blijven wachten?%n%nZo niet, dan stopt het instellen.
nl.WebSocketNotConfigured=Zet de WebSocket-server aan: Tools → WebSocket Server Instellingen → WebSocket server inschakelen.
nl.FinishedHowTo=Start OBS en open Docks → StreamoScope. Bij de eerste start vraagt het dock om het WebSocket-wachtwoord: Tools → WebSocket Server Instellingen → Toon verbindingsinformatie.
nl.UninstallObsRunning=OBS is geopend. Sluit OBS en probeer het opnieuw, zodat het dock en het script ook uit OBS verdwijnen.
nl.UninstallSetupRunning=De installatie van StreamoScope loopt. Wacht tot die klaar is en probeer het opnieuw.
nl.UninstallFilesOnly=Alleen de bestanden verwijderen en het dock en het script in de instellingen van OBS laten staan?
nl.UninstallFailed=Het dock en het script konden niet automatisch uit OBS worden verwijderd. Verwijder het dock in Docks en het script in Tools → Scripts.
nl.Details=Details:

tr.ConfiguringObs=OBS ayarlanıyor...
tr.ObsRunning=OBS açık. OBS'yi kapatıp yeniden deneyin.%n%nİptal ederseniz kurulum OBS ayarlanmadan tamamlanır.
tr.SetupSkipped=Panel ve betik OBS'ye eklenmedi. OBS'yi kapatıp kurulumu yeniden çalıştırın ya da kılavuza göre elle ekleyin:
tr.ObsNotStarted=OBS bu bilgisayarda henüz hiç açılmadı. OBS'yi bir kez açıp kapatın ve kurulumu yeniden çalıştırın.
tr.SetupFailed=Panel ve betik OBS'ye otomatik olarak eklenemedi, OBS'de hiçbir şey değişmedi. Kılavuza göre elle ekleyin:
tr.SetupStopped=OBS'yi ayarlamak çok uzun sürdü ve durduruldu. Kurulumu yeniden çalıştırın ya da paneli ve betiği kılavuza göre elle ekleyin:
tr.ScriptSlow=OBS'yi ayarlamak her zamankinden uzun sürüyor. Beklemeye devam edilsin mi?%n%nEdilmezse ayarlama durdurulur.
tr.WebSocketNotConfigured=WebSocket sunucusunu açın: Araçlar → WebSocket Suncusu Ayarları → WebSocket sunucuyu etkinleştir.
tr.FinishedHowTo=OBS'yi açın ve Paneller → StreamoScope'u seçin. İlk açılışta panel WebSocket parolasını sorar: Araçlar → WebSocket Suncusu Ayarları → Bağlanma Bilgilerini Göster.
tr.UninstallObsRunning=OBS açık. Panel ve betik OBS'den de kaldırılsın diye OBS'yi kapatıp yeniden deneyin.
tr.UninstallSetupRunning=StreamoScope kurulumu sürüyor. Bitmesini bekleyip yeniden deneyin.
tr.UninstallFilesOnly=Yalnızca dosyalar silinsin, panel ve betik OBS ayarlarında kalsın mı?
tr.UninstallFailed=Panel ve betik OBS'den otomatik olarak kaldırılamadı. Paneli Paneller menüsünden, betiği Araçlar → Betikler'den kaldırın.
tr.Details=Ayrıntılar:

th.ConfiguringObs=กำลังตั้งค่า OBS...
th.ObsRunning=OBS เปิดอยู่ ปิด OBS แล้วลองอีกครั้ง%n%nถ้ายกเลิก การติดตั้งจะจบโดยไม่ตั้งค่า OBS
th.SetupSkipped=ยังไม่ได้เพิ่มแผงและสคริปต์ลงใน OBS ปิด OBS แล้วเรียกใช้การติดตั้งอีกครั้ง หรือเพิ่มเองตามคู่มือ:
th.ObsNotStarted=ยังไม่เคยเปิด OBS บนคอมพิวเตอร์เครื่องนี้ เปิด OBS หนึ่งครั้ง ปิดลง แล้วเรียกใช้การติดตั้งอีกครั้ง
th.SetupFailed=เพิ่มแผงและสคริปต์ลงใน OBS โดยอัตโนมัติไม่ได้ และไม่มีอะไรเปลี่ยนใน OBS เพิ่มเองตามคู่มือ:
th.SetupStopped=การตั้งค่า OBS ใช้เวลานานเกินไปและถูกหยุด เรียกใช้การติดตั้งอีกครั้ง หรือเพิ่มแผงและสคริปต์เองตามคู่มือ:
th.ScriptSlow=การตั้งค่า OBS ใช้เวลานานกว่าปกติ รอต่อไหม?%n%nถ้าไม่รอ การตั้งค่าจะหยุด
th.WebSocketNotConfigured=เปิดเซิร์ฟเวอร์ WebSocket: เครื่องมือ → การตั้งค่าเซิร์ฟเวอร์ WebSocket → เปิดใช้งานเซิร์ฟเวอร์ WebSocket
th.FinishedHowTo=เปิด OBS แล้วไปที่ ถาดงาน → StreamoScope เมื่อเปิดครั้งแรก แผงจะขอรหัสผ่าน WebSocket: เครื่องมือ → การตั้งค่าเซิร์ฟเวอร์ WebSocket → แสดงข้อมูลการเชื่อมต่อ
th.UninstallObsRunning=OBS เปิดอยู่ ปิด OBS แล้วลองอีกครั้ง เพื่อให้แผงและสคริปต์ถูกนำออกจาก OBS ด้วย
th.UninstallSetupRunning=การติดตั้ง StreamoScope กำลังทำงานอยู่ รอให้เสร็จแล้วลองอีกครั้ง
th.UninstallFilesOnly=ลบเฉพาะไฟล์ และเก็บแผงกับสคริปต์ไว้ในการตั้งค่า OBS ไหม?
th.UninstallFailed=นำแผงและสคริปต์ออกจาก OBS โดยอัตโนมัติไม่ได้ นำแผงออกในเมนู ถาดงาน และนำสคริปต์ออกใน เครื่องมือ → Scripts
th.Details=รายละเอียด:

[Code]
const
  ResultSuccess = 0;
  ResultFailed = 1;
  ResultObsRunning = 2;
  ResultObsConfigNotFound = 3;
  ResultSuccessWithoutWebSocket = 10;
  ResultStopped = -1;
  GuideUrl = '{#AppUrl}#readme';
  SlowScriptMilliseconds = 180000;
  WaitStepMilliseconds = 50;
  TerminateWaitMilliseconds = 5000;
  StartupInfoSize = 68;
  StartupUseShowWindow = $1;
  CreateNoWindow = $8000000;
  WaitObjectSignaled = 0;
  WaitTimedOut = 258;
  PeekMessageRemove = $1;

type
  TStartupInfo = record
    Size: Longword;
    Reserved: Longword;
    Desktop: Longword;
    Title: Longword;
    Left: Longword;
    Top: Longword;
    Width: Longword;
    Height: Longword;
    ConsoleColumns: Longword;
    ConsoleRows: Longword;
    FillAttribute: Longword;
    Flags: Longword;
    ShowCommand: Word;
    ReservedSize: Word;
    ReservedData: Longword;
    StandardInput: Longword;
    StandardOutput: Longword;
    StandardError: Longword;
  end;

  TProcessInformation = record
    ProcessHandle: Longword;
    ThreadHandle: Longword;
    ProcessId: Longword;
    ThreadId: Longword;
  end;

  TWindowMessage = record
    Window: Longword;
    MessageId: Longword;
    WordParameter: Longword;
    LongParameter: Longword;
    MessageTime: Longword;
    CursorX: Longword;
    CursorY: Longword;
    ReservedData: Longword;
  end;

var
  ObsSetupNote: String;
  ShouldRemoveFromObs: Boolean;

function CreateProcess(ApplicationName, CommandLine: String; ProcessAttributes, ThreadAttributes: Longword; InheritHandles: BOOL; CreationFlags, Environment: Longword; CurrentDirectory: String; var StartupInfo: TStartupInfo; var ProcessInformation: TProcessInformation): BOOL;
  external 'CreateProcessW@kernel32.dll stdcall';

function WaitForSingleObject(Handle, Milliseconds: Longword): Longword;
  external 'WaitForSingleObject@kernel32.dll stdcall';

function GetExitCodeProcess(ProcessHandle: Longword; var ExitCode: Longword): BOOL;
  external 'GetExitCodeProcess@kernel32.dll stdcall';

function TerminateProcess(ProcessHandle, ExitCode: Longword): BOOL;
  external 'TerminateProcess@kernel32.dll stdcall';

function CloseHandle(Handle: Longword): BOOL;
  external 'CloseHandle@kernel32.dll stdcall';

function Wow64DisableWow64FsRedirection(var RedirectionState: Longword): BOOL;
  external 'Wow64DisableWow64FsRedirection@kernel32.dll stdcall';

function Wow64RevertWow64FsRedirection(RedirectionState: Longword): BOOL;
  external 'Wow64RevertWow64FsRedirection@kernel32.dll stdcall';

function GetTickCount: Longword;
  external 'GetTickCount@kernel32.dll stdcall';

function PeekMessage(var WindowMessage: TWindowMessage; Window, FirstMessage, LastMessage, RemoveFlags: Longword): BOOL;
  external 'PeekMessageW@user32.dll stdcall';

function TranslateMessage(var WindowMessage: TWindowMessage): BOOL;
  external 'TranslateMessage@user32.dll stdcall';

function DispatchMessage(var WindowMessage: TWindowMessage): Longword;
  external 'DispatchMessageW@user32.dll stdcall';

function GetLogPath: String;
begin
  Result := ExpandConstant('{localappdata}\streamoscope\configure-obs.log');
end;

function ReadCurrentVersion: String;
var
  Content: AnsiString;
  Text: String;
  QuotePosition: Integer;
  CharacterIndex: Integer;
begin
  Result := '';

  if not LoadStringFromFile(ExpandConstant('{app}\current-version.js'), Content) then
    Exit;

  Text := String(Content);
  QuotePosition := Pos('''', Text);

  if QuotePosition = 0 then
    Exit;

  Text := Copy(Text, QuotePosition + 1, Length(Text));
  QuotePosition := Pos('''', Text);

  if QuotePosition <= 1 then
    Exit;

  Text := Copy(Text, 1, QuotePosition - 1);

  for CharacterIndex := 1 to Length(Text) do
    if Pos(Text[CharacterIndex], '0123456789.') = 0 then
      Exit;

  Result := Text;
end;

function GetConfigureObsPath: String;
var
  Version: String;
begin
  Version := ReadCurrentVersion;
  Result := ExpandConstant('{app}\versions\') + Version + '\configure-obs.ps1';

  if (Version = '') or not FileExists(Result) then
    Result := ExpandConstant('{app}\configure-obs.ps1');
end;

procedure ProcessWindowMessages;
var
  WindowMessage: TWindowMessage;
begin
  while PeekMessage(WindowMessage, 0, 0, 0, PeekMessageRemove) do
  begin
    TranslateMessage(WindowMessage);
    DispatchMessage(WindowMessage);
  end;
end;

function WaitForScript(ProcessHandle: Longword): Integer;
var
  WaitStart: Longword;
  ExitCode: Longword;
begin
  WaitStart := GetTickCount;

  while WaitForSingleObject(ProcessHandle, WaitStepMilliseconds) = WaitTimedOut do
  begin
    ProcessWindowMessages;

    if GetTickCount - WaitStart < SlowScriptMilliseconds then
      Continue;

    Log('The script is still running after ' + IntToStr((GetTickCount - WaitStart) div 1000) + ' s');

    if SuppressibleMsgBox(CustomMessage('ScriptSlow'), mbConfirmation, MB_YESNO, IDNO) = IDYES then
      WaitStart := GetTickCount
    else if WaitForSingleObject(ProcessHandle, 0) = WaitTimedOut then
    begin
      TerminateProcess(ProcessHandle, ResultFailed);
      WaitForSingleObject(ProcessHandle, TerminateWaitMilliseconds);
      Log('The script was stopped');
      Result := ResultStopped;
      Exit;
    end;
  end;

  if GetExitCodeProcess(ProcessHandle, ExitCode) then
    Result := ExitCode
  else
    Result := ResultFailed;
end;

function RunConfigureObs(const Mode: String): Integer;
var
  ScriptPath: String;
  PowerShellPath: String;
  CommandLine: String;
  StartupInfo: TStartupInfo;
  ProcessInformation: TProcessInformation;
  RedirectionState: Longword;
  IsRedirectionDisabled: Boolean;
  IsStarted: Boolean;
begin
  ScriptPath := GetConfigureObsPath;
  PowerShellPath := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
  CommandLine := '"' + PowerShellPath + '" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + ScriptPath + '" -Mode ' + Mode + ' -InstallDirectory "' + ExpandConstant('{app}') + '"';
  StartupInfo.Size := StartupInfoSize;
  StartupInfo.Flags := StartupUseShowWindow;
  StartupInfo.ShowCommand := SW_HIDE;
  Log('Starting ' + ScriptPath + ' -Mode ' + Mode);

  IsRedirectionDisabled := Wow64DisableWow64FsRedirection(RedirectionState);

  try
    IsStarted := CreateProcess(PowerShellPath, CommandLine, 0, 0, False, CreateNoWindow, 0, ExpandConstant('{app}'), StartupInfo, ProcessInformation);
  finally
    if IsRedirectionDisabled then
      Wow64RevertWow64FsRedirection(RedirectionState);
  end;

  if IsStarted then
  begin
    CloseHandle(ProcessInformation.ThreadHandle);
    Result := WaitForScript(ProcessInformation.ProcessHandle);
    CloseHandle(ProcessInformation.ProcessHandle);
  end else
  begin
    Log('PowerShell did not start: ' + SysErrorMessage(DLLGetLastError));
    Result := ResultFailed;
  end;

  Log(ScriptPath + ' -Mode ' + Mode + ' exit code: ' + IntToStr(Result));
end;

procedure ConfigureObs;
var
  Code: Integer;
begin
  WizardForm.StatusLabel.Caption := CustomMessage('ConfiguringObs');

  repeat
    Code := RunConfigureObs('Install');

    if Code <> ResultObsRunning then
      Break;

    if SuppressibleMsgBox(CustomMessage('ObsRunning'), mbError, MB_RETRYCANCEL, IDCANCEL) <> IDRETRY then
      Break;
  until False;

  case Code of
    ResultSuccess:
      ObsSetupNote := '';
    ResultSuccessWithoutWebSocket:
      ObsSetupNote := CustomMessage('WebSocketNotConfigured');
    ResultObsRunning:
      ObsSetupNote := CustomMessage('SetupSkipped') + #13#10 + GuideUrl;
    ResultObsConfigNotFound:
      ObsSetupNote := CustomMessage('ObsNotStarted');
    ResultStopped:
      ObsSetupNote := CustomMessage('SetupStopped') + #13#10 + GuideUrl + #13#10#13#10 + CustomMessage('Details') + ' ' + GetLogPath;
  else
    ObsSetupNote := CustomMessage('SetupFailed') + #13#10 + GuideUrl + #13#10#13#10 + CustomMessage('Details') + ' ' + GetLogPath;
  end;
end;

procedure WriteCurrentVersion;
begin
  SaveStringToFile(ExpandConstant('{app}\current-version.js'), 'window.STREAMOSCOPE_VERSION = ''{#AppVersion}'';' + #13#10, False);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    WriteCurrentVersion;
    ConfigureObs;
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
var
  Text: String;
begin
  if CurPageID <> wpFinished then
    Exit;

  Text := CustomMessage('FinishedHowTo');

  if ObsSetupNote <> '' then
    Text := ObsSetupNote + #13#10#13#10 + Text;

  WizardForm.FinishedLabel.Caption := Text;
  WizardForm.FinishedLabel.AdjustHeight;
end;

function InitializeUninstall: Boolean;
begin
  Result := True;
  ShouldRemoveFromObs := True;

  while CheckForMutexes('{#SetupMutexName}') do
    if SuppressibleMsgBox(CustomMessage('UninstallSetupRunning'), mbError, MB_RETRYCANCEL, IDCANCEL) <> IDRETRY then
    begin
      Result := False;
      Exit;
    end;

  CreateMutex('{#SetupMutexName}');

  while RunConfigureObs('Check') = ResultObsRunning do
  begin
    if SuppressibleMsgBox(CustomMessage('UninstallObsRunning'), mbError, MB_RETRYCANCEL, IDCANCEL) <> IDRETRY then
    begin
      if SuppressibleMsgBox(CustomMessage('UninstallFilesOnly'), mbConfirmation, MB_YESNO, IDNO) <> IDYES then
        Result := False;

      ShouldRemoveFromObs := False;
      Exit;
    end;
  end;
end;

procedure RemoveFromObs;
var
  Code: Integer;
begin
  if not ShouldRemoveFromObs then
    Exit;

  Code := RunConfigureObs('Uninstall');

  if (Code <> ResultSuccess) and (Code <> ResultObsConfigNotFound) then
    SuppressibleMsgBox(CustomMessage('UninstallFailed') + #13#10#13#10 + CustomMessage('Details') + ' ' + GetLogPath, mbInformation, MB_OK, IDOK);
end;

procedure RemoveProgramData;
begin
  RunConfigureObs('RemoveData');
end;

procedure RemoveInstallDirectory;
var
  InstallDirectory: String;
begin
  InstallDirectory := ExpandConstant('{app}');

  if CompareText(InstallDirectory, ExpandConstant('{userpf}\{#AppSlug}')) = 0 then
    DelTree(InstallDirectory, True, True, True);
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  case CurUninstallStep of
    usUninstall:
      begin
        RemoveFromObs;
        RemoveProgramData;
      end;
    usPostUninstall:
      RemoveInstallDirectory;
  end;
end;
