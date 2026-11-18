# ADR 0002: Platform support tiers

- Status: Accepted
- Date: 2026-11-13
- Deciders: plugin maintainer

## Context

DSH runs on Windows, macOS, and Linux, both as a Desktop app and as a Web UI.
The notification core (sound, system notifications, settings, queue) is
platform-agnostic, but window activation and taskbar/Dock attention depend on
OS APIs that are not equally available:

- Windows: `SetForegroundWindow` and `FlashWindowEx` can be called by another
  process.
- macOS: activation is scriptable, but Dock attention
  (`NSApplication.requestUserAttention`) belongs to the application itself.
- Linux X11: `wmctrl`/`xdotool` can activate and set the urgency hint.
- Linux Wayland: no portable activation/urgency API; compositor-specific tools
  only.
- Browser UI: a window can be activated by title, a specific tab cannot be
  switched reliably from outside.

## Decision

Three tiers:

| Tier | Platforms | Promise |
| --- | --- | --- |
| 1 | Windows | Full feature set, CI-verified |
| 2 | macOS, Linux X11 | Notifications, sound, settings, queue; focus and attention where the OS permits, best effort |
| 3 | Linux Wayland, browser UI | Notifications and queue; window activation/attention best effort or absent |

Tier membership is documented in `README.md` and `docs/STATUS.md`; the code never
pretends a capability exists when the adapter reports it unavailable.

## Consequences

- Every capability is optional and returns a structured "unsupported" answer.
- Tier 3 limitations are product decisions, not bugs.
- Adding a platform or raising a tier requires an ADR update, tests, and a
  manual checklist entry.
- macOS Dock attention is a known Tier 2 gap until DSH exposes an API
  (see ADR 0005).
