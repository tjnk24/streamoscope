---
name: live-install-check
description: Live check of the StreamoScope installer and uninstaller on the user's real Windows and OBS - snapshot of the OBS settings and StreamoScope data with OBS closed, the user runs setup.exe and the uninstaller from Explorer, then scripted comparison after install, after uninstall answered No and after uninstall answered Yes (Apps entry, install folder, data folder, configure-obs.log, OBS files by hash, profiles without the bridge sections), and finally the official release from GitHub back in place. Use when the user asks to check the installer, the uninstaller or a release live, in real OBS, on their own machine.
---

# Live install check

Why the user, not Claude, starts the installer: `.claude/rules/windows/installer.md` (Claude Desktop is an MSIX package, a setup started from it lands in the package container). What the installer and the uninstaller do: `docs/internals/installer.md`. The scripts here only read the real files and write into the snapshot folder, so Claude runs them itself.

Update this skill in the same change whenever the conversation shows it is outdated or a better way turned up.

## Ground rules

- The user's real OBS. While a game or a stream is running, touch nothing; ask first.
- Every snapshot goes into the scratchpad, never into the repository: it holds `service.json` with the stream key and the profiles. Never read, print or quote files from a snapshot; the scripts compare by hash and print only names and lengths.
- Snapshots are taken with OBS closed (`Save-LiveSnapshot.ps1` refuses otherwise) and are never overwritten.
- Run every script as `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_SKILL_DIR}\<script>.ps1" ...`. Each ends with `failures: N`.

## Scripts

| Script | What it does |
|---|---|
| `Save-LiveSnapshot.ps1 -SnapshotDirectory <dir>` | Copies `%APPDATA%\obs-studio\global.ini`, `user.ini`, `basic\` and `%LOCALAPPDATA%\streamoscope`, stores hashes of the data and install folders |
| `Test-LiveInstall.ps1 [-ExpectedVersion X.Y.Z]` | Apps entry, `current-version.js`, the stub equals `installer/loader/streamoscope-bridge.lua`, files of the install folder and of `versions\<version>`, one dock in the ini named by `install-manifest.json`, the bridge in every collection of the manifest, tails of `configure-obs.log` and the journal |
| `Compare-LiveSnapshot.ps1 -SnapshotDirectory <dir> -Expect Installed` | Lists OBS files the install changed (expected: the docks ini, scene collections, the obs-websocket config if it was off) |
| `... -Expect Unchanged` | After uninstall answered **No**: Apps entry still there, every OBS file byte for byte, data and install folders unchanged except `configure-obs.log` |
| `... -Expect Removed` | After uninstall answered **Yes**: Apps entry and install folder gone, data folder without any of `$script:RemovedDataItems` but with `configure-obs.log`, profiles equal the copy passed through `Remove-IniSection` for every section of `$script:BridgeProfileSections`, every other OBS file byte for byte or with exactly one cut that contains `streamoscope` |

Helpers: `Get-ObsFiles.ps1`, `Get-TreeHashes.ps1`, `Write-CheckResult.ps1`; the scripts also load `installer/ConfigureObs` and the updater's `consts.ps1` from the repository.

## Steps

1. **What is checked.** A local build (`npm run package:installer` -> `release\streamoscope-setup-<version>-local.exe`) or a published release. Tell the user the plan and the setup path.
2. **Before install.** OBS closed -> `Save-LiveSnapshot.ps1 -SnapshotDirectory <scratchpad>\live-before-install`.
3. **Install.** The user runs the setup from Explorer and says when it is done. Then `Test-LiveInstall.ps1 -ExpectedVersion <version>` and `Compare-LiveSnapshot.ps1 -SnapshotDirectory <scratchpad>\live-before-install -Expect Installed`. If the dock itself needs a look, the user opens OBS, checks it and closes OBS again.
4. **Before uninstall.** OBS closed -> `Save-LiveSnapshot.ps1 -SnapshotDirectory <scratchpad>\live-before-uninstall`.
5. **Uninstall, No.** The user removes StreamoScope in Windows Settings -> Apps and answers **No**. `Compare-LiveSnapshot.ps1 -SnapshotDirectory <scratchpad>\live-before-uninstall -Expect Unchanged`.
6. **Uninstall, Yes.** Same again, answering **Yes**. `Compare-LiveSnapshot.ps1 -SnapshotDirectory <scratchpad>\live-before-uninstall -Expect Removed`.
7. **Back to the official version.** Ask before downloading (name, source, size): `gh release download --repo tjnk24/streamoscope --pattern "streamoscope-setup-*.exe*" --dir <scratchpad>\official`, then `minisign -V -p minisign.pub -m <setup>`. Tell the user the path; they run it from Explorer; `Test-LiveInstall.ps1 -ExpectedVersion <latest>`.
8. **Report.** A short table: stage, failures, what failed. Every FAIL is either a bug (say which file and line of the installer is suspect) or a gap in this skill (fix the skill).

## If something went wrong

OBS settings can be put back from `live-before-install\obs-studio` or `live-before-uninstall\obs-studio` only with OBS closed and after the user's yes for exactly that copy. The installer's own backups are in `%LOCALAPPDATA%\streamoscope\backups\<date>`. Leftovers of a setup that was started from Claude by mistake are in `%LOCALAPPDATA%\Packages\Claude_*\LocalCache`; remove such an install with its own uninstaller from the same environment.
