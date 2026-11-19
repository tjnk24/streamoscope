# StreamoScope — troubleshooting

Something off with the dock or with a stream? Start here. Settings and privacy are in the [main README](../README.md).

## 🔧 Dock and installer problems

| Problem | Try this first |
| --- | --- |
| Dock is missing | **Docks → StreamoScope** |
| Can't connect | Enable OBS WebSocket; check port and password |
| Some platform names are generic | Check the Lua bridge is loaded in the active scene collection |
| GPU stats are missing | Check the Lua bridge on Windows |
| Installer didn't configure OBS | See `%LOCALAPPDATA%\streamoscope\configure-obs.log`; rerun with OBS closed |
| Installer takes long at **Setting up OBS...** | It normally takes seconds, even with dozens of scene collections. After three minutes it asks whether to keep waiting; if you stop it, rerun it with OBS closed or set OBS up as in [Manual installation](../README.md#-manual--portable-installation) |
| Dock asks to run the installer | Close OBS and run the latest `streamoscope-setup-<version>.exe` over your install; settings and the journal stay |
| An update says the new version didn't start and went back | If OBS opens the dock slowly, versions up to 0.10.0 can mistake that for a broken start. Close OBS and run the latest `streamoscope-setup-<version>.exe` once: it installs without that check, and from there on updates wait for a slow dock |

## 🩺 Stream problems

When a stream runs into trouble, a red icon lights up next to the row with the problem. Hover over it to see what's wrong; **What to do?** opens the steps below. The icon appears once the problem has lasted three seconds and goes out three seconds after it's over.

| Problem | Where the icon shows | Try this |
| --- | --- | --- |
| Frames are being dropped | **Dropped per minute**: at least 1% of frames lost in the last minute | Lower the bitrate in **Settings → Output**; turn on dynamic bitrate in **Settings → Advanced → Network**; use a cable instead of Wi-Fi and pause other uploads; pick a closer server |
| The network is congested | **Network congestion**: the send buffer is at least half full | Same as for dropped frames: the network barely keeps up, and drops are next |
| OBS is reconnecting | Next to the status of the card | Check the internet connection; if it keeps dropping, pick another server; check on the platform's site that the stream hasn't ended there |
| The GPU is overloaded | **Rendering missed**: at least 0.5% of frames in the last minute | Cap the game's FPS; run OBS as administrator; close other GPU-heavy apps; lower the **Base (Canvas) Resolution** or FPS in **Settings → Video** |
| The encoder can't keep up | **Encoder skipped**: at least 0.5% of frames in the last minute | Pick a faster preset in **Settings → Output**; switch from x264 to a hardware encoder (NVENC, AMF, Quick Sync); lower the **Output (Scaled) Resolution** or FPS in **Settings → Video** |

## 🆘 Still stuck?

[Open an issue](https://github.com/tjnk24/streamoscope/issues), preferably with **Settings → Diagnostics → Copy diagnostics** and the file `streamoscope.log` from **Open journal folder**. If the dock won't open, the file is in `%LOCALAPPDATA%\streamoscope\logs`. Please don't attach passwords or stream keys.
