# Changelog

## 1.0.0

First public release.

### Notifications

- Sound cues and system toasts for completed turns, failed turns, and requests
  waiting for the user.
- Waiting requests raise the window when the focus option is enabled; completed
  and failed turns never do.
- Subagent sessions stay silent: no toast, sound, taskbar flash, or focus.

### Control

- Per-session mute from the session header and sidebar rows, plus a global mute.
- Volume slider from 0% to 100% (70% default); at 0% notifications stay on and
  only the cue is silenced.
- Optional sound for the active session, even when the window is open and
  focused.
- Sequential confirmation queue that shows waiting sessions one at a time.

### Platform

- Windows: window activation and the standard `FlashWindowEx` taskbar flash,
  without changing focus, size, Z-order, or visibility.
- macOS and Linux: sound, system notifications, settings, and the queue; window
  activation is planned.

### Settings and data

- Preferences stored in `$DSH_HOME/storages/dsh-yany-plugin/settings.json` with
  atomic writes.
- Pre-release `dsh-notify` settings and browser preferences migrate
  automatically on first load.

### Compatibility and documentation

- Requires DSH `>=0.2.2-rc.1 <0.3.0` and Node.js `>=20`.
- English source dictionary plus translations for every official DSH language:
  简体中文, Deutsch, Español, Français, 日本語, Português, Русский.
- README, status, plan, CI design, and architecture decision records.
