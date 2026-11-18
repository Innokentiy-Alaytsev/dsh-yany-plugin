# @crufteneer/dsh-yany-plugin

[![npm](https://img.shields.io/npm/v/@crufteneer/dsh-yany-plugin?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@crufteneer/dsh-yany-plugin) [![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/) [![DSH](https://img.shields.io/badge/DSH-%3E%3D0.2.2--rc.1%20%3C0.3.0-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![powered by dsh](https://img.shields.io/badge/powered_by_dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![License: MIT](https://img.shields.io/badge/license-MIT-3DA639?style=flat-square)](LICENSE) [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#requirements)

**YANY — Yet Another NotifY plugin.** Desktop notifications for DeepSeek
Harness: a sound and a system toast when a turn finishes, when a turn fails, and
when the agent is waiting for you — with per-session mute and a queue that
brings confirmation requests to the front one at a time.

## Features

The Web interface follows the DSH language setting. English is the source
dictionary; translations ship for every language DSH officially supports:
**简体中文** (`zh`), **Deutsch** (`de`), **Español** (`es`), **Français**
(`fr`), **日本語** (`ja`), **Português** (`pt`), and **Русский** (`ru`).
The plugin metadata (`locale/*.json`) is translated for the same set.

| Event | Sound | System notification | Window foreground |
| --- | --- | --- | --- |
| Turn completed | short rising two-tone cue | "Turn completed" + session title | no |
| Turn failed | descending cue | "Turn failed" + error text | no |
| Waiting for input (approval, question, plan review) | three-tone cue | "Waiting for your input" + reason/question | yes, when enabled |

While you are already looking at the session in the front window, a waiting
request is not announced again: the approval card is on screen and the window
must not be disturbed. Enable **Sound for the active session** in the settings
panel to still play the completion, failure, and waiting cues for that session
— useful when the window stays open and focused while you are doing something
else. The option is global: it applies to every session and is not repeated in
the per-session controls. It adds sound only; the active session still gets no
system toast and no window action.

### Confirmation queue

When several sessions wait for an answer, the window shows them one by one:

1. a request arrives — its session opens and the window is raised;
2. you answer it — the next waiting session opens;
3. this continues until the queue is empty.

A pending request is never interrupted by the next one: the queue stays on it
until it is answered. Muted sessions never enter the queue.

### Taskbar flash

When a notification fires while the window is not in the foreground, the plugin
uses the standard Windows `FlashWindowEx` API with `FLASHW_TRAY |
FLASHW_TIMERNOFG`: the taskbar button flashes until the window is activated. It
never changes focus, Z-order, size, visibility, or the foreground window, and it
is skipped when the window is already in the foreground. This covers the case
where a turn finished successfully but the cue and the toast were missed.

## Install

```sh
dsh plugin --profile <profile> add @crufteneer/dsh-yany-plugin
```

Update an existing installation:

```sh
dsh plugin --profile <profile> up @crufteneer/dsh-yany-plugin
```

Restart the profile (or reload the page) after installing or updating.

For local development, link the checkout instead:

```sh
dsh plugin --profile <profile> add link:<absolute path to this package>
```

`plugin_manager` with `install_bundle` and this directory as `target` does the
same for a local bundle.

## Requirements

- DeepSeek Harness with the bundle plugin system (`dsh.bundle.patch`,
  `dsh.profile.bundles`), DSH **`>=0.2.2-rc.1 <0.3.0`**. Earlier versions are
  not tested and are outside the support contract.
- Window focus and taskbar flash: Windows. macOS and Linux still get sound,
  system notifications, settings, and the confirmation queue; their window
  activation is planned (see [docs/PLAN.md](docs/PLAN.md)).

## Limitations

- Notifications require an open Web UI page.
- System toasts use the HTML5 `Notification` API; they are `silent` because the
  plugin plays its own cue.
- Subagent (child) sessions never notify: no toast, sound, taskbar flash, or
  focus. They are identified by the Session header's `origin: "subagent"`, so a
  historical fork that kept a parent id is still treated as an ordinary
  session.
- Window focus is Windows-only. Taskbar flash is Windows-only as well; it uses
  the standard shell flash and does not touch the window itself.
- The browser UI can activate a browser window by title but cannot switch a
  specific tab; the in-page queue still works.

## Controls

- **Bell in the sidebar footer** — the settings panel: mute everything, sound,
  volume, sound for the active session, system notifications, window focus on
  request, and a test notification.
- **Bell in the session header** — mute or unmute notifications for the open
  session only.
- **Bell on a sidebar row hover** — the same per-session toggle for any session.
  A muted session keeps a struck-through bell in its row.

Preferences are stored by the Host in
`$DSH_HOME/storages/dsh-yany-plugin/settings.json` (falling back to
`~/.dsh/storages/dsh-yany-plugin/settings.json`). The file is created on the
first page load, and preferences left in `localStorage` by earlier versions are
migrated into it. On upgrade from `dsh-notify`, the old
`storages/dsh-notify/settings.json` is read once, written to the new location,
and removed. The page keeps a `localStorage` copy under
`dsh-yany.prefs.v1` only as a fast cache and offline fallback; the old
`dsh-notify.prefs.v1` key is migrated on first load.

Defaults:

```json
{ "master": true, "sound": true, "native": true, "focus": true, "activeSound": false, "volume": 0.7, "mutedSessions": [] }
```

`master: false` mutes the whole application.

The **Volume** slider is the loudness of the synthesized cues, from 0% to 100%
with a 70% default. The cue envelopes carry an 8× baseline gain so that 100% is
audible on a typical desktop mix; it is a gain applied between the cue and the
audio output, so the Windows application volume and the system volume still
multiply it. At 0% notifications are not disabled: turn completion, failures,
and waiting requests still produce system toasts, only the cue becomes
inaudible. The separate **Sound** switch is what turns cues off completely.

### Why a plugin state file

DSH keeps a plugin's *configuration* in the profile's Cordis patch
(`cordis.patch.yml`); the Settings forms there expose only fields declared
`.volatile()`, and every write edits a file the user owns. Durable *runtime
state* belongs in a plugin state file instead — that is what the `storages`
directory and the `ctx.storageDomain` service exist for, and community plugins
such as `dsh-task-notifier` follow the same convention.

These preferences change from the UI at runtime, including a per-session mute
list that changes on every bell click, so rewriting the profile patch each time
would be the wrong place. The plugin uses its own file under
`$DSH_HOME/storages/dsh-yany-plugin/`, written atomically by the Host and
exposed to the page through `GET`/`POST /dsh-yany/settings`.

## How it works

- **Client half** (`lib/client.js`) subscribes to `ctx.uiSession.sessionStatus`
  (`running` and `pendingInteraction`), listens for `api-session/error`, plays
  Web Audio cues, shows `Notification` toasts, and owns the focus queue.
  Switching to a waiting session uses `ctx.uiWorkspace.openSession(id)`.
- **Host half** (`lib/index.js`) registers `GET /dsh-yany/ping`,
  `GET`/`POST /dsh-yany/settings`, and `POST /dsh-yany/focus` /
  `POST /dsh-yany/flash` on the Web server. It owns the settings file and runs
  the focus helpers.
- **`scripts/focus.ps1`** enumerates visible top-level windows, restores a
  genuinely minimized window, and asks Windows to activate it. It never calls
  `ShowWindow(SW_SHOW)`, `SetWindowPos`, or `BringWindowToTop` on a visible
  window: those calls can undo a maximized or snapped layout, which looks like
  the window collapsing.
- **`scripts/flash.ps1`** flashes the taskbar button with `FlashWindowEx`; it
  never changes focus or window geometry.
- When the Win32 path cannot focus a Desktop window (for example, the window is
  hidden to the tray), the Host relaunches the Desktop executable. Its
  single-instance handler restores, shows, and focuses the existing window. A
  plain `dsh web` Host runs `node.exe` and simply skips this step.

## Development

```sh
node --check lib/index.js
node --check lib/client.js
node test/client.test.mjs
```

The test harness loads `lib/client.js` with stubbed browser globals and Client
Cordis services, then drives session-status transitions and asserts the
observable behaviour: slot registration, completion and failure notifications,
waiting requests, the focus queue, per-session mute, the settings panel, volume,
active-session sound, subagent silence, and taskbar flash calls.

Live Host checks:

```powershell
Invoke-WebRequest http://127.0.0.1:<port>/dsh-yany/ping
Invoke-WebRequest http://127.0.0.1:<port>/dsh-yany/settings
Invoke-WebRequest http://127.0.0.1:<port>/dsh-yany/flash -Method POST -ContentType application/json -Body '{}'
Invoke-WebRequest http://127.0.0.1:<port>/dsh-yany/focus -Method POST -ContentType application/json -Body '{}'
```

## Documentation

- [docs/STATUS.md](docs/STATUS.md) — what works today on each platform and the
  current plan progress.
- [docs/PLAN.md](docs/PLAN.md) — phased cross-platform work plan, estimates,
  acceptance criteria, and risks.
- [docs/CI.md](docs/CI.md) — proposed GitHub Actions test and release setup.
- [docs/adr/](docs/adr/) — architecture decision records, including the minimum
  DSH version and the platform support tiers.
