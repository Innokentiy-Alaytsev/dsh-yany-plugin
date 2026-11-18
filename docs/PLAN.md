# Cross-platform work plan

Plan derived from the portability assessment. It is intentionally incremental:
the plugin keeps working on Windows at every step, and other platforms gain
capabilities without changing the notification core.

## Goal

Full behaviour of `@crufteneer/dsh-yany-plugin` on every DSH-supported desktop
platform:

- notifications, sound, settings, queue — already cross-platform;
- window activation and taskbar/Dock attention — on Windows now, on macOS and
  Linux after this plan, with documented limits where the OS does not allow it.

## Non-goals

- Changing DSH itself or shipping a forked DSH.
- Forcing focus, resizing, hiding, or reordering windows beyond an explicit
  activation request from the user's confirmation queue.
- Browser tab switching from another process; only window activation by title.
- Supporting DSH versions older than `0.2.2-rc.1`.

## Principles

1. Standard OS mechanisms only; no UI automation and no synthetic input.
2. Every platform capability is optional: a missing capability degrades to a
   no-op, never to an error visible to the user.
3. The notification core stays platform-agnostic; only adapters know about the
   OS.
4. Every adapter is testable without a real desktop where possible, and has a
   documented manual check where it is not.

## Support tiers

| Tier | Platforms | Promise |
| --- | --- | --- |
| 1 | Windows | Full feature set, CI-verified |
| 2 | macOS, Linux X11 | Full notifications and queue; focus and attention where the OS permits, best effort |
| 3 | Linux Wayland, browser UI | Notifications and queue; window activation/attention best effort or absent |

See [ADR 0002](adr/0002-platform-support-tiers.md).

## Phases

Status legend: `done`, `planned`, `in progress`, `blocked`.

### P0 — Baseline (done)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P0.1 | Pin the minimum DSH version | `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` in `package.json` | Install and activation on `0.2.2-rc.1`; README states the range | done |
| P0.2 | Document status and plan | `docs/STATUS.md`, `docs/PLAN.md`, `docs/CI.md` | Documents reflect the current code and estimates | done |
| P0.3 | Record key decisions | `docs/adr/0001`–`0005` | Each ADR has context, decision, consequences, status | done |

### P1 — Platform adapters (1–2 days)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P1.1 | Define the adapter contract | `focusWindow()`, `requestAttention()`, `capabilities` per platform | Contract documented; no `process.platform` checks outside adapter selection | planned |
| P1.2 | Move Win32 code behind the contract | `adapters/win32.js` invoking the existing PowerShell helpers | Windows behaviour unchanged; scripts still shipped | planned |
| P1.3 | Register routes on every platform | `/focus` and `/flash` answer consistently; unsupported platforms return a structured `501 { supported: false }` | Client keeps its silent degradation | planned |
| P1.4 | Adapter unit tests | Tests with mocked platform, spawn, and exit codes | Adapter selection and capability flags covered | planned |

### P2 — macOS (1–2 days, one item blocked)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P2.1 | Focus adapter | `osascript`/`open -a` activation for the Desktop app; `System Events` title fallback for a browser window | Activation works on a real Mac; no focus change when already front | planned |
| P2.2 | Dock attention | Native `requestUserAttention` path | **Blocked**: needs a DSH Desktop API, see [ADR 0005](adr/0005-macos-dock-attention.md) | blocked |
| P2.3 | macOS verification | Manual checklist and an AppleScript-driven CI check | Focus confirmed; Dock attention honestly reported as unavailable | planned |

### P3 — Linux (3–6 days)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P3.1 | X11 focus adapter | `wmctrl -a` or `xdotool windowactivate`, with availability probing | Focus changes on Xvfb + openbox/fluxbox; missing tools degrade to no-op | planned |
| P3.2 | X11 attention | `_NET_WM_STATE_DEMANDS_ATTENTION` via `wmctrl`/`xdotool` | Urgency state observable with `xprop` | planned |
| P3.3 | Wayland best effort | Capability detection; `kdotool`/`gdbus`/`xdg-activation` where available | Documented as best effort; never errors | planned |
| P3.4 | Linux CI | Xvfb-based window job | Assertions on `_NET_ACTIVE_WINDOW` and urgency | planned |

### P4 — Packaging and native helpers (2–4 days)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P4.1 | Decide helper vs CLI dependencies | ADR covering binaries, signing, and fallbacks | Decision recorded before code | planned |
| P4.2 | Build and sign (if helpers) | Per-OS/arch artifacts; macOS notarization; Windows signing | Reproducible release build, checksums | planned |
| P4.3 | Package assets | `files` and docs updated | `npm pack --dry-run` contains every runtime asset | planned |

### P5 — CI implementation (3–5 days)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P5.1 | `ci.yml` unit/package jobs | Node 20/22 matrix, `check`, `test`, `npm pack` | Green on push and PR | planned |
| P5.2 | Install-smoke matrix | Windows/macOS/Ubuntu against pinned DSH | `dsh --dump-config`, `/ping`, `/settings`, platform-specific `/flash` status | planned |
| P5.3 | Window-behaviour job | WinForms on Windows, AppleScript on macOS, Xvfb on Linux | Focus/attention assertions where the runner permits | planned |
| P5.4 | `release.yml` | Tag-driven tarball (and helpers) with signing | Release artifacts reproducible and checksummed | planned |

### P6 — Verification and release (1–2 days)

| ID | Task | Deliverable | Acceptance | Status |
| --- | --- | --- | --- | --- |
| P6.1 | Windows manual checklist | Toast, taskbar flash, focus, volume, mute | All pass on a real desktop | planned |
| P6.2 | macOS/Linux manual checklist | Toast, Dock/attention, focus | Documented results, including limitations | planned |
| P6.3 | Update status and release notes | `STATUS.md`, `CHANGELOG.md`, README | Documents match the shipped behaviour | planned |

## Timeline

| Milestone | Approx. effort |
| --- | --- |
| Tier 2 with Windows + macOS focus + Linux X11 | 2–3 weeks (one developer) |
| Above plus Wayland best effort and native helper signing | 4–6 weeks |
| macOS Dock attention | blocked on a DSH Desktop API; 0.5 day once available |

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| macOS Dock attention needs the app's own NSApplication | No parity for that cue | Document, use activation/toast, request a DSH API |
| Wayland exposes no portable activation | Incomplete Linux parity | Tier 3, best effort, capability detection |
| Focus-stealing prevention on all OSes | Activation may be refused | No retries beyond the standard call; never fake input |
| Native helper signing and notarization | Release friction | Prefer OS CLIs; helper only if unavoidable |
| Hosted CI runners are not interactive desktops | Flaky GUI tests | API-level tests + self-hosted or manual checks |
| Adapter refactor regresses Windows | Broken primary platform | Keep the existing PowerShell paths, lock behaviour with tests |

## Definition of done

1. Every Tier 1/Tier 2 capability has an adapter, a unit test, and a manual
   check on real hardware.
2. Unsupported capabilities return a structured "unsupported" answer, and the
   client degrades without user-visible errors.
3. `engines.dsh` is `>=0.2.2-rc.1 <0.3.0` and CI verifies install on that
   version.
4. `STATUS.md`, `CHANGELOG.md`, and `README.md` describe exactly what each
   platform does.
