# ADR 0005: macOS Dock attention needs a DSH Desktop API

- Status: Proposed (blocked)
- Date: 2026-11-13
- Deciders: plugin maintainer, DSH Desktop maintainers (future)

## Context

On Windows the taskbar flash is available to any process through
`FlashWindowEx`. macOS has no equivalent cross-process call:
`NSApplication.requestUserAttention(_:)` is an instance method of the
application whose icon should bounce. The plugin's Host is a child process
started by the Desktop app (Electron in Node mode), not the `NSApplication`
owner. A helper bundle cannot request attention for another app's Dock icon.

Alternatives considered:

1. `osascript`/`open -a` — activates the app but does not bounce the Dock icon.
2. A separate helper app — its `requestUserAttention` bounces the helper's icon,
   not DSH's; it also adds a signed artifact and a second identity.
3. `display notification` — a duplicate toast, not Dock attention.
4. Accessibility/UI scripting — rejected: fragile and invasive.

## Decision

Do not fake Dock attention. Request a small DSH Desktop API (for example an IPC
command that calls `app.dock.bounce('critical')` and `app.dock.cancelBounce`),
exposed to Host plugins through the Desktop shell. Until it exists:

- macOS gets activation and system notifications;
- Dock attention is reported as unavailable in `docs/STATUS.md`;
- the macOS adapter exposes `attention: false`.

## Consequences

- macOS Tier 2 parity is partial by design until the API exists.
- No unsigned helper, no extra identity, no UI automation.
- If DSH adds the API, implementing it is a small adapter change (~0.5 day) and
  a manual check.
