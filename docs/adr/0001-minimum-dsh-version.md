# ADR 0001: Minimum supported DSH version

- Status: Accepted
- Date: 2026-11-13
- Deciders: plugin maintainer
- Supersedes: the previous `>=0.2.0-0 <0.3.0` range

## Context

The plugin is developed and verified against DSH `0.2.2-rc.1`. Earlier `0.2.x`
prereleases are not tested and the maintainer does not intend to test them.
Supporting a range that includes untested versions would imply a compatibility
promise the project cannot verify.

## Decision

`package.json` declares:

```json
"engines": { "dsh": ">=0.2.2-rc.1 <0.3.0" }
```

`0.2.2-rc.1` is the minimum supported version. Later `0.2.x` releases remain in
range; `0.3.0` and newer are excluded until the plugin is retested.

## Consequences

- Installing on an older DSH is outside the support contract; it may work or
  fail, but no CI job covers it.
- CI installs the minimum (`0.2.2-rc.1`) and the latest `0.2.x` to catch a
  range regression.
- Raising the minimum again is a minor release with a changelog entry.
- The README and `docs/STATUS.md` state the range explicitly.
