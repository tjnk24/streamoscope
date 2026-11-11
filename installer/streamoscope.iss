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
UninstallDisplayName={#AppName}{#BuildSuffix}
VersionInfoVersion={#AppVersion}
VersionInfoProductName={#AppName}

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "ru"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "de"; MessagesFile: "compiler:Languages\German.isl"
Name: "ptbr"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

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
Type: files; Name: "{app}\rolled-back-version.txt"

[Files]
Source: "{#PackageDir}\*"; DestDir: "{app}\versions\{#AppVersion}"; Excludes: "README.txt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#PackageDir}\streamoscope-bridge.lua"; DestDir: "{app}"; Flags: ignoreversion
Source: "loader\index.html"; DestDir: "{app}\dock"; Flags: ignoreversion
Source: "configure-obs.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "images\streamoscope.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "ConfigureObs\*.ps1"; DestDir: "{app}\ConfigureObs"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#MinisignPath}"; DestDir: "{app}\updater"; Flags: ignoreversion
Source: "third-party\minisign-LICENSE.txt"; DestDir: "{app}\updater"; Flags: ignoreversion

[CustomMessages]
en.ConfiguringObs=Setting up OBS...
en.ObsRunning=OBS is running. Close OBS and try again.%n%nIf you cancel, setup finishes without setting up OBS.
en.SetupSkipped=OBS was not set up. Close OBS and run this setup again, or add the dock and the script by hand as described in the guide:
en.ObsNotStarted=OBS has not been started on this computer yet. Start OBS once, close it and run this setup again.
en.SetupFailed=OBS could not be set up automatically, and nothing was changed in it. Add the dock and the script by hand as described in the guide:
en.WebSocketNotConfigured=Turn on the WebSocket server: Tools → WebSocket Server Settings → Enable WebSocket server.
en.FinishedHowTo=Start OBS and open Docks → StreamoScope. On first start the dock asks for the WebSocket password: Tools → WebSocket Server Settings → Show Connect Info.
en.UninstallObsRunning=OBS is running. Close OBS and try again, so that the dock and the script are removed from OBS too.
en.UninstallFilesOnly=Delete only the files and leave the dock and the script in the OBS settings?
en.UninstallFailed=The dock and the script could not be removed from OBS automatically. Remove the dock in Docks and the script in Tools → Scripts.
en.Details=Details:

ru.ConfiguringObs=Настройка OBS...
ru.ObsRunning=OBS запущен. Закройте OBS и повторите попытку.%n%nЕсли отменить, установка завершится без настройки OBS.
ru.SetupSkipped=OBS не настроен. Закройте OBS и запустите установку ещё раз или добавьте панель и скрипт вручную по инструкции:
ru.ObsNotStarted=OBS на этом компьютере ещё ни разу не запускался. Запустите OBS один раз, закройте его и запустите установку ещё раз.
ru.SetupFailed=Не удалось настроить OBS автоматически, в нём ничего не изменено. Добавьте панель и скрипт вручную по инструкции:
ru.WebSocketNotConfigured=Включите сервер WebSocket: Сервис → Настройки сервера WebSocket → Включить сервер WebSocket.
ru.FinishedHowTo=Запустите OBS и откройте Док-панели → StreamoScope. При первом запуске панель попросит пароль WebSocket: Сервис → Настройки сервера WebSocket → Показать сведения о подключении.
ru.UninstallObsRunning=OBS запущен. Закройте OBS и повторите попытку, чтобы панель и скрипт убрались и из OBS.
ru.UninstallFilesOnly=Удалить только файлы, а панель и скрипт оставить в настройках OBS?
ru.UninstallFailed=Не удалось убрать панель и скрипт из OBS автоматически. Удалите панель в меню Док-панели, а скрипт — в Сервис → Скрипты.
ru.Details=Подробности:

es.ConfiguringObs=Configurando OBS...
es.ObsRunning=OBS está abierto. Cierre OBS y vuelva a intentarlo.%n%nSi cancela, la instalación terminará sin configurar OBS.
es.SetupSkipped=OBS no se ha configurado. Cierre OBS y vuelva a ejecutar el instalador, o añada el panel y el script a mano según la guía:
es.ObsNotStarted=OBS aún no se ha abierto en este equipo. Abra OBS una vez, ciérrelo y vuelva a ejecutar el instalador.
es.SetupFailed=No se pudo configurar OBS automáticamente y no se ha cambiado nada en él. Añada el panel y el script a mano según la guía:
es.WebSocketNotConfigured=Active el servidor WebSocket: Herramientas → Ajustes del servidor WebSocket → Habilitar servidor WebSocket.
es.FinishedHowTo=Abra OBS y elija Paneles → StreamoScope. La primera vez el panel pedirá la contraseña de WebSocket: Herramientas → Ajustes del servidor WebSocket → Mostrar información de conexión.
es.UninstallObsRunning=OBS está abierto. Cierre OBS y vuelva a intentarlo para quitar también el panel y el script de OBS.
es.UninstallFilesOnly=¿Eliminar solo los archivos y dejar el panel y el script en la configuración de OBS?
es.UninstallFailed=No se pudieron quitar el panel y el script de OBS automáticamente. Quite el panel en Paneles y el script en Herramientas → Scripts.
es.Details=Detalles:

de.ConfiguringObs=OBS wird eingerichtet...
de.ObsRunning=OBS ist geöffnet. Schließen Sie OBS und versuchen Sie es erneut.%n%nBeim Abbrechen wird das Setup ohne Einrichtung von OBS beendet.
de.SetupSkipped=OBS wurde nicht eingerichtet. Schließen Sie OBS und starten Sie das Setup erneut, oder fügen Sie Dock und Skript laut Anleitung von Hand hinzu:
de.ObsNotStarted=OBS wurde auf diesem Computer noch nie gestartet. Starten Sie OBS einmal, schließen Sie es und starten Sie das Setup erneut.
de.SetupFailed=OBS konnte nicht automatisch eingerichtet werden, es wurde nichts daran geändert. Fügen Sie Dock und Skript laut Anleitung von Hand hinzu:
de.WebSocketNotConfigured=Aktivieren Sie den WebSocket-Server: Werkzeuge → WebSocket-Servereinstellungen → WebSocket-Server aktivieren.
de.FinishedHowTo=Starten Sie OBS und öffnen Sie Docks → StreamoScope. Beim ersten Start fragt das Dock nach dem WebSocket-Passwort: Werkzeuge → WebSocket-Servereinstellungen → Verbindungsinformationen anzeigen.
de.UninstallObsRunning=OBS ist geöffnet. Schließen Sie OBS und versuchen Sie es erneut, damit Dock und Skript auch aus OBS entfernt werden.
de.UninstallFilesOnly=Nur die Dateien löschen und Dock und Skript in den OBS-Einstellungen lassen?
de.UninstallFailed=Dock und Skript konnten nicht automatisch aus OBS entfernt werden. Entfernen Sie das Dock unter Docks und das Skript unter Werkzeuge → Skripte.
de.Details=Details:

ptbr.ConfiguringObs=Configurando o OBS...
ptbr.ObsRunning=O OBS está aberto. Feche o OBS e tente novamente.%n%nSe cancelar, a instalação terminará sem configurar o OBS.
ptbr.SetupSkipped=O OBS não foi configurado. Feche o OBS e execute o instalador novamente, ou adicione o painel e o script manualmente seguindo o guia:
ptbr.ObsNotStarted=O OBS ainda não foi aberto neste computador. Abra o OBS uma vez, feche-o e execute o instalador novamente.
ptbr.SetupFailed=Não foi possível configurar o OBS automaticamente e nada foi alterado nele. Adicione o painel e o script manualmente seguindo o guia:
ptbr.WebSocketNotConfigured=Ative o servidor WebSocket: Ferramentas → Configurações do servidor WebSocket → Ativar servidor WebSocket.
ptbr.FinishedHowTo=Abra o OBS e escolha Painéis → StreamoScope. Na primeira vez o painel pedirá a senha do WebSocket: Ferramentas → Configurações do servidor WebSocket → Mostrar informações da conexão.
ptbr.UninstallObsRunning=O OBS está aberto. Feche o OBS e tente novamente para remover também o painel e o script do OBS.
ptbr.UninstallFilesOnly=Excluir apenas os arquivos e deixar o painel e o script nas configurações do OBS?
ptbr.UninstallFailed=Não foi possível remover o painel e o script do OBS automaticamente. Remova o painel em Painéis e o script em Ferramentas → Scripts.
ptbr.Details=Detalhes:

[Code]
const
  ResultSuccess = 0;
  ResultFailed = 1;
  ResultObsRunning = 2;
  ResultObsConfigNotFound = 3;
  ResultSuccessWithoutWebSocket = 10;
  GuideUrl = '{#AppUrl}#readme';

var
  ObsSetupNote: String;
  ShouldRemoveFromObs: Boolean;

function GetLogPath: String;
begin
  Result := ExpandConstant('{localappdata}\streamoscope\configure-obs.log');
end;

function RunConfigureObs(const Mode: String): Integer;
var
  ResultCode: Integer;
begin
  if not Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
    '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}\configure-obs.ps1') + '" -Mode ' + Mode,
    ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    ResultCode := ResultFailed;

  Result := ResultCode;
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
  else
    ObsSetupNote := CustomMessage('SetupFailed') + #13#10 + GuideUrl + #13#10#13#10 + CustomMessage('Details') + ' ' + GetLogPath;
  end;

  Log('configure-obs.ps1 exit code: ' + IntToStr(Code));
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

  Log('configure-obs.ps1 exit code: ' + IntToStr(Code));

  if (Code <> ResultSuccess) and (Code <> ResultObsConfigNotFound) then
    SuppressibleMsgBox(CustomMessage('UninstallFailed') + #13#10#13#10 + CustomMessage('Details') + ' ' + GetLogPath, mbInformation, MB_OK, IDOK);
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
      RemoveFromObs;
    usPostUninstall:
      RemoveInstallDirectory;
  end;
end;
