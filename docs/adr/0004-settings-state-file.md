# ADR 0004: Settings in a plugin state file

- Status: Accepted
- Date: 2026-11-13
- Deciders: plugin maintainer
- Related: implementation in `lib/index.js`

## Context

DSH keeps a plugin's *configuration* in the profile's Cordis patch
(`cordis.patch.yml`); the Settings forms expose only `.volatile()` fields and
every write edits a file the user owns. The notification preferences change at
runtime from the plugin panel — including the per-session mute list, which
changes on every bell click. Rewriting the profile patch for each toggle is the
wrong place, and storing preferences in `localStorage` makes them browser-local
and invisible to the Host.

## Decision

Preferences live in a plugin state file:

```
$DSH_HOME/storages/dsh-yany-plugin/settings.json
```

The Host owns the file, writes it atomically (temporary file + rename), and
serves it through `GET`/`POST /dsh-yany/settings`. The page keeps
`localStorage` only as a fast cache and offline fallback; a first load migrates
older local values into the file. The file is the single source of truth.

The pre-release rename from `dsh-notify` moves the file from
`$DSH_HOME/storages/dsh-notify/settings.json`. On first load the Host copies the
old file to the new directory, removes the old one after a successful write, and
the browser migrates `dsh-notify.prefs.v1` to `dsh-yany.prefs.v1`.

## Consequences

- Preferences survive restarts, profile switches, and different browsers.
- The file is inspectable and can be edited directly; the Host re-reads it on
  every request.
- No dependency on the Settings service or Schemastery.
- The plugin does not touch the user's `cordis.patch.yml`.
- A future move to a Settings namespace remains possible and would be a
  separate ADR.
