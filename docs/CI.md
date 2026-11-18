# CI infrastructure

Proposed GitHub Actions setup. The repository has no CI yet; this document is
the design to implement in P5. Terminology follows GitHub Actions: workflows,
jobs, runners, matrices.

## Test layers

| Layer | Runs where | Verifies |
| --- | --- | --- |
| L1 — static and unit | Ubuntu | Syntax, client harness (`node test/client.test.mjs`), locale parity, packaged file list |
| L2 — package contract | Ubuntu | `npm pack` contains `lib/`, `scripts/`, `locale/`, `assets/`, `docs/`, manifest exports resolve |
| L3 — install smoke | Windows, macOS, Ubuntu | A real pinned DSH profile installs the tarball, activates the row, and answers the HTTP routes |
| L4 — platform window behaviour | Windows, macOS, Linux (Xvfb) | Focus/attention adapters against a scratch window; no real desktop on hosted runners |
| L5 — manual | Real hardware | Toast appearance, audible cue, Dock/taskbar visuals, Wayland behaviour |

The existing client harness is L1 and runs without a browser or a DSH process;
it already covers slots, notifications, queue, mute, settings sync, volume,
subagent silence, and flash calls.

## `ci.yml` — push and pull request

| Job | Runner | Steps (conceptual) |
| --- | --- | --- |
| `checks` | `ubuntu-latest`, Node 20 and 22 matrix | checkout; setup Node; `npm ci` (no runtime deps today); `npm run check`; `npm test`; upload reports |
| `package` | `ubuntu-latest` | `npm pack --dry-run --json`; assert every `files`/`exports` path exists; `npm pack`; upload the tarball as an artifact |
| `install-smoke` | matrix `windows-latest`, `macos-latest`, `ubuntu-latest` | setup Node and pnpm; install pinned DSH `0.2.2-rc.1`; `dsh plugin --profile ci add <tarball>`; assert `dsh --profile ci --dump-config` contains the `dsh-yany-plugin` row (package `@crufteneer/dsh-yany-plugin`); start `dsh web` on a free loopback port; call `GET /dsh-yany/ping` and `/settings`; on Windows expect `POST /flash` to be handled; on macOS/Linux expect the documented `501`/`404` |
| `compatibility` | `ubuntu-latest` | Repeat `package` / install smoke against the minimum DSH (`0.2.2-rc.1`) and the latest `0.2.x`; assert `engines.dsh` accepts the first and rejects `0.3.0` |

Notes:

- The Host is a Cordis plugin; `install-smoke` must use the real CLI rather than
  a mocked loader, so a broken `dsh.bundle.patch`, `dsh.client`, or `exports`
  fails before release.
- The `dsh web` startup prints an authenticated URL; the smoke test parses it
  and reuses the cookie/token for the loopback calls. Do not add a second auth
  path just for CI.
- The profile used for smoke tests is disposable (`--profile ci`), removed
  between runs.

## `window-actions.yml` — platform behaviour

A separate workflow keeps GUI flakiness away from the fast unit pipeline.

| Job | Runner | What it checks |
| --- | --- | --- |
| `windows-window` | `windows-latest` | A PowerShell harness creates a WinForms window titled for the adapter, calls the focus and flash helpers, and compares `GetWindowPlacement`/`GetForegroundWindow`. GitHub-hosted Windows runners are not interactive, so the job treats focus assertions as best effort and always verifies flash ran without changing placement |
| `macos-window` | `macos-latest` | An AppleScript harness targets a scratch app (e.g. TextEdit) and verifies activation; Dock attention is asserted only at the API/exit-code level, never visually |
| `linux-x11` | `ubuntu-latest` | `xvfb-run` with `openbox`/`fluxbox` and `xterm`; assert `_NET_ACTIVE_WINDOW` after focus and `_NET_WM_STATE_DEMANDS_ATTENTION` after attention, using `xprop`/`wmctrl` |
| `linux-wayland` | `ubuntu-latest` | Optional `continue-on-error`: capability detection only; a headless Wayland compositor is not a substitute for a real desktop |

If a runner cannot provide a reliable interactive session, the corresponding
job moves to a self-hosted runner with a real desktop session, or the check
becomes manual in `docs/STATUS.md`.

## `release.yml` — tags

| Job | Trigger | Purpose |
| --- | --- | --- |
| `build` | `v*` tag | `npm pack`, optional native helper builds per OS/arch, checksums |
| `sign` | tag + environment approval | macOS notarization and Windows signing from environment secrets |
| `publish` | tag | GitHub Release with tarball, checksums, and release notes |

Release artifacts are reproducible from a clean checkout; signing secrets live
in a protected GitHub Environment and are never exposed to pull-request runs.

## What CI cannot verify

- That a Windows toast actually appears in the notification center.
- That a cue is audible at the chosen volume.
- That the taskbar button or macOS Dock icon visibly flashes/bounces.
- Wayland activation on a specific compositor.
- Focus-stealing policy outcomes on a real interactive desktop.

These stay in the manual checklist:

| Platform | Manual checks |
| --- | --- |
| Windows | Toast, sound, taskbar flash, focus restore from minimized, no focus change when foreground |
| macOS | Toast, sound, activation, Dock behaviour (documented limitation) |
| Linux X11 | Toast (libnotify), sound, activation, urgency hint |
| Linux Wayland | Toast/sound only; activation/urgency documented as best effort |
| Browser UI | Notification permission, sound, in-page queue navigation |

## Reporting and hygiene

- Cache the pnpm store and Node downloads; keep jobs under a 10–15 minute
  timeout.
- Upload the client harness output and any packaged tarball as artifacts.
- `permissions: contents: read` for CI; `contents: write` only in release.
- No secrets in PR workflows; signing is environment-gated on tags.
- A failing platform window job must not block the fast L1/L2 jobs; mark it
  `continue-on-error` only while the runner limitation is documented, never to
  hide a product regression.
