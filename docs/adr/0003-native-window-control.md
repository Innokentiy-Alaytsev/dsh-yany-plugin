# ADR 0003: Native window control without interference

- Status: Accepted
- Date: 2026-11-13
- Deciders: plugin maintainer

## Context

The plugin must raise a window when a confirmation request arrives and make a
missed notification visible in the taskbar. Earlier versions manipulated the
window with `ShowWindow(SW_SHOW)`, `SetWindowPos`, and `BringWindowToTop`, which
could undo a maximized or snapped layout and looked like the window collapsing.

The product requirement is explicit: do not change focus, bring the window to
the foreground, or otherwise interfere with the application or the system,
except for the requested confirmation queue activation.

## Decision

- Attention uses the OS-native mechanism only: `FlashWindowEx` with
  `FLASHW_TRAY | FLASHW_TIMERNOFG` on Windows. Adapters for other platforms must
  use their native equivalent (Dock attention, urgency hint).
- Activation is a separate, explicit operation: restore a genuinely minimized
  window, then `SetForegroundWindow`. Never call `ShowWindow(SW_SHOW)`,
  `SetWindowPos`, or `BringWindowToTop` on a visible window.
- If the window is already in the foreground, both operations are skipped.
- No synthetic keyboard or mouse input, no repeated retries that fight the
  OS focus policy.
- The queue only activates the session that is waiting for the user; it never
  moves, resizes, hides, or reorders the window.

## Consequences

- The plugin cannot force activation when the OS refuses it; it degrades to a
  notification and a taskbar flash.
- Adapters are small and testable: a focus call and an attention call, nothing
  else.
- The client never calls `window.focus()` while the Host route is available.
