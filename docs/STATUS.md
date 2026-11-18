# Status

Snapshot: 2026-11-19, plugin **1.0.0**, DSH **0.2.2-rc.1**.

## Pre-release migration

Earlier pre-release builds used the name `dsh-notify`; the first public release
is **`@crufteneer/dsh-yany-plugin`** (YANY — Yet Another NotifY plugin),
published under the `crufteneer` npm scope. The package name, client module id,
HTTP routes (`/dsh-yany/*`), settings directory, and `localStorage` keys
changed. The bundle row id and the settings directory keep the short name
`dsh-yany-plugin` rather than the scoped package name. Preferences migrate
automatically: the old `storages/dsh-notify/settings.json` is copied to
`storages/dsh-yany-plugin/settings.json` and removed, and
`dsh-notify.prefs.v1` is migrated to `dsh-yany.prefs.v1`.

## Capability matrix

| Capability | Windows | macOS | Linux | Notes |
| --- | --- | --- | --- | --- |
| Turn completed / failed / waiting detection | Yes | Yes | Yes | Client-side `sessionStatus` and `api-session/error` |
| Sound cues (Web Audio) | Yes | Yes | Yes | Volume 0–100 %, default 70 % |
| System notifications (`Notification`) | Yes | Yes | Yes | Electron desktop; browser needs permission |
| Active-session sound option | Yes | Yes | Yes | Global preference |
| Per-session and global mute | Yes | Yes | Yes | Stored in the Host settings file |
| Confirmation queue / session switching | Yes | Yes | Yes | `ctx.uiWorkspace.openSession()` |
| Window activation on request | Yes | No | No | `scripts/focus.ps1` is Win32-only |
| Taskbar attention flash | Yes | No | No | `FlashWindowEx`; macOS/Linux return 501 |
| Subagent turn silence | Yes | Yes | Yes | `origin: "subagent"` classification |
| Durable settings file | Yes | Yes | Yes | `$DSH_HOME/storages/dsh-yany-plugin/settings.json` |

On non-Windows the Host still registers `GET`/`POST /dsh-yany/settings` and
returns `501` from `/dsh-yany/flash`; `/focus` is not registered. The client
degrades silently: no flash, `window.focus()` fallback, all other behaviour
unchanged.

## Plan progress

| Phase | Scope | Status | Estimate |
| --- | --- | --- | --- |
| P0 | Baseline: pin minimum DSH, docs, ADRs, CI design | **Done** | — |
| P1 | Extract platform adapters from `lib/index.js` | Planned | 1–2 days |
| P2 | macOS focus adapter; Dock attention decision | Planned | 1–2 days |
| P3 | Linux X11 focus/attention; Wayland best effort | Planned | 3–6 days |
| P4 | Native helpers (if needed), packaging, signing | Planned | 2–4 days |
| P5 | GitHub Actions implementation | Planned | 3–5 days |
| P6 | Manual platform verification and release docs | Planned | 1–2 days |

See [PLAN.md](PLAN.md) for tasks, acceptance criteria, and dependencies.

## Verification today

- `node --check lib/index.js` and `lib/client.js` — pass.
- `node test/client.test.mjs` — **75/75** checks: slots, completion, failure,
  waiting, queue, mute, settings sync, localization key parity for every
  official DSH language, subagent silence, volume, active-session sound,
  taskbar flash calls.
- Live Windows checks: `/dsh-yany/ping`, `/settings`, `/flash` and `/focus`
  answer `200`; `flash.ps1` reports `ALREADY_FOREGROUND` when the window is in
  front; `focus.ps1` restores a minimized window.
- Not covered: real toast appearance, audible loudness, macOS/Linux window
  behaviour, Wayland.

## Known gaps and blockers

1. **macOS Dock attention** cannot be requested from the Host child process.
   `NSApplication.requestUserAttention` belongs to the application itself; a
   helper cannot bounce another app's Dock icon. Waiting for a DSH Desktop API
   (see [ADR 0005](adr/0005-macos-dock-attention.md)).
2. **Wayland** does not expose a portable activation/urgency API; only
   compositor-specific tools work. Planned as best effort.
3. **Browser UI** can activate a browser window by title but cannot reliably
   switch a specific tab; queue navigation still works inside the page.
4. **CI GUI tests** are limited on hosted runners; some window checks need a
   self-hosted interactive runner or stay manual.

## Next action

Start P1 (adapter extraction) after the plan is accepted. P2 depends on P1; P5
can start in parallel with the first CI skeleton.
