---
name: streamoscope-release
description: Release a new StreamoScope version end to end - choose the version number, prepare screenshots and README, write docs/release-notes/<version>.md, run npm version, push the tag only after the user confirms, wait for the user to approve the publish job, then verify the published GitHub release (minisign signatures, SHA256SUMS.txt, compatibility comment, assets) and update project memory. Use when the user asks to release, publish, ship, tag or hotfix a version, or asks what is left before a release.
---

# StreamoScope release

The rules live in `.claude/rules/releases.md` (version choice, promises to old versions, hotfix branches, what only the installer updates) and `docs/DEVELOPMENT.md` -> "Releases and signed updates". Read both before step 1; this skill only orders the steps and adds the checks. If this file and the rules disagree, the rules win and this file gets fixed in the same change.

Update this skill in the same change whenever the conversation shows it is outdated or a better way turned up.

## 1. What goes out

- `git log --oneline v<last>..HEAD` and `git status`: everything since the last tag, nothing uncommitted.
- Pick major/minor/patch by the largest change, as `releases.md` says. Show the user the list of changes and the chosen number; wait for a yes.
- Hotfix of a released version while `main` holds unreleased work: the `hotfix/X.Y.Z` branch from the tag, as in `releases.md`.

## 2. Preparation

- `npm run lint` and `npm test` pass (the release workflow runs the tests again, a red run only costs time).
- If the dock looks different: new screenshots for README (`docs/images/stats-wide.png`, shown at 700 px, and `docs/images/stats-narrow.png`, shown at 280 px) from the test stand (`npm run stand -- screenshot`, see `docs/internals/testing.md`), and README text that matches. Check in the browser at 300 and 670 px before the commit.
- README and `docs/DEVELOPMENT.md` already describe every user-visible change of this release.
- Raised requirements are in `config/compatibility.json`.

## 3. Release notes

`docs/release-notes/<version>.md`: English first, then a line `---`, then Russian; the tone of README (dry workshop humour), short bullets about what people notice, not about code.

If the release changes anything outside `versions\` (the bridge stub `installer/loader/streamoscope-bridge.lua`, the dock loader `installer/loader/index.html`, the uninstaller in `installer/streamoscope.iss`, the fallback `configure-obs.ps1` with `ConfigureObs/`, `minisign.exe`, the icon, or a new file outside `versions\`), the notes open in both languages with a `> [!IMPORTANT]` block "run the installer once": what changes, the link `https://github.com/tjnk24/streamoscope/releases/download/v<version>/streamoscope-setup-<version>.exe`, and that settings, the journal and OBS stay. `docs/release-notes/0.7.1.md` is the model. Check with `git diff --stat v<last>..HEAD -- installer/loader installer/streamoscope.iss installer/configure-obs.ps1 installer/ConfigureObs`.

Never write the `<!-- compatibility: ... -->` line yourself: the workflow appends it.

Show the notes to the user and wait for their edits.

## 4. Version and tag

- Commit the notes (and anything from step 2) only when the user asks.
- `npm version <major|minor|patch>` makes the commit `X.Y.Z` and the tag `vX.Y.Z`.
- **Push only after an explicit yes from the user for this release**: `git push --follow-tags` (hotfix: `git push --follow-tags -u origin hotfix/X.Y.Z`).
- `gh run watch` on the `release.yml` run (`gh run list --workflow release.yml --limit 1`). When `build` is green, tell the user that the `publish` job waits for **their** approval on the run page. Never approve it yourself.

## 5. After publication

Run the check into a fresh folder in the scratchpad:

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_SKILL_DIR}\Test-PublishedRelease.ps1" -Version X.Y.Z -DownloadDirectory "<scratchpad>\release-X.Y.Z"
```

It checks: published and not a prerelease, GitHub's latest release is this tag, exactly the seven assets (`streamoscope-setup-X.Y.Z.exe`, `streamoscope-X.Y.Z.zip`, `compatibility.json`, their `.minisig`, `SHA256SUMS.txt`), the notes start with `docs/release-notes/X.Y.Z.md` and end with the compatibility comment equal to `compatibility.json`, minisign signatures against `minisign.pub`, `SHA256SUMS.txt` for the installer and the zip, the zip has the top folder `streamoscope-X.Y.Z/` and every file of `RequiredPackageFiles`. Expected: `failures: 0`. It needs `gh` signed in and `minisign` (on PATH, or the copy that `npm run package:installer` caches, or the installed updater's).

A failure means people may get a broken update within 48 hours: tell the user at once, with the failed line.

If the release needs a live look in OBS (installer, uninstaller, stub), use the `live-install-check` skill.

## 6. Memory

Update `obs-stats-widget-backlog.md` (and `silent-updates-design.md` if the updater changed) in the project memory: the released version, what is now done, what moved to the next release.
