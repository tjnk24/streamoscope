StreamoScope {{version}}, portable

This folder is laid out like an installed StreamoScope, so the dock updates itself: signed packages from GitHub, a new version only after it has been out for 48 hours, and an automatic rollback if it fails to start.

1. Copy this folder somewhere permanent, for example %LOCALAPPDATA%\streamoscope-portable. Updates go into this folder, so it must stay writable.
2. OBS: Docks -> Custom Browser Docks. Add a dock with the URL file:///<folder>/dock/index.html
3. OBS: Tools -> WebSocket Server Settings. Enable the server and note the port and password.
4. OBS: Tools -> Scripts. Add streamoscope-bridge.lua from this folder. Updates and the rollback need it in every scene collection you use.

Keep the folder as it is: the dock, the script and the updater find each other by their places in it.
updater\minisign.exe checks the signatures of downloaded updates; it is the official minisign build (ISC license next to it).

To remove: delete the dock and the script in OBS, then this folder and %LOCALAPPDATA%\streamoscope.

Full guide: https://github.com/tjnk24/streamoscope#readme
