# Security

## Supported versions

Only the latest release gets fixes. The dock offers updates by itself, so staying on the latest version is one
button away.

## Reporting a problem

Report security problems privately: open the Security tab of this repository and press
[Report a vulnerability](https://github.com/tjnk24/streamoscope/security/advisories/new).
Please do not open a public issue for them. English or Russian is fine.

Things worth reporting include:

- a way to make the updater install something other than a signed release of this project;
- a way to make the bridge script run a command or open an address it should not;
- the dock, the diagnostics or the error report exposing the obs-websocket password or a stream key;
- the installer changing OBS settings beyond what the README describes.

## How releases are protected

- Releases are built and signed by GitHub Actions; the secret key exists only as a repository secret.
- The installer, the zip archive and `compatibility.json` are signed with [minisign](https://jedisct1.github.io/minisign/).
  The public key is [minisign.pub](minisign.pub) and is also built into the updater.
- The updater downloads only from this repository's releases, checks the signatures before running anything
  and refuses versions older than or equal to the installed one.
- The bridge script opens in the browser only this repository's GitHub pages and local `http://127.0.0.1:<port>/` addresses
  (used to test updates), through the Windows URL handler; addresses with user info (`@`), quotes or spaces are refused.
  The only other programs it starts are the bundled updater and Windows Explorer, which opens the journal folder
  when you press the button for it.

To check a download yourself, see [Verify downloads in the README](README.md#-verify-downloads).
