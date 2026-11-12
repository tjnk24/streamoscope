StreamoScope {{version}}

1. Copy this folder somewhere permanent, for example %LOCALAPPDATA%\streamoscope.
2. OBS: Docks -> Custom Browser Docks. Add a dock with the URL file:///<folder>/dock/index.html
3. OBS: Tools -> WebSocket Server Settings. Enable the server and note the port and password.
4. OBS: Tools -> Scripts. Add streamoscope-bridge.lua (needed for obs-multi-rtmp outputs, GPU and memory).
   Keep the streamoscope-bridge folder next to it: the script loads its parts from there.

configure-obs.ps1 and the ConfigureObs folder are used by the installer; a manual install doesn't need them.

Full guide: https://github.com/tjnk24/streamoscope#readme
