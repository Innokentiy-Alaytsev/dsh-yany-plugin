# @crufteneer/dsh-yany-plugin documentation

Status, plan, CI design, and architecture decisions for the
`@crufteneer/dsh-yany-plugin` plugin.

## Documents

| Document | Purpose |
| --- | --- |
| [STATUS.md](STATUS.md) | What works today, on which platform, and where the plan stands |
| [PLAN.md](PLAN.md) | Phased cross-platform work plan with estimates and acceptance criteria |
| [CI.md](CI.md) | Proposed GitHub Actions test and release infrastructure |
| [adr/](adr/) | Architecture decision records |

## Baseline

- Plugin version: **1.0.0**
- Supported DSH: **`>=0.2.2-rc.1 <0.3.0`** (see [ADR 0001](adr/0001-minimum-dsh-version.md))
- Primary platform: **Windows** (full feature set)
- Secondary platforms: **macOS**, **Linux** — notifications, sound, settings, and
  the queue work; window activation and taskbar/Dock attention do not yet (see
  [ADR 0002](adr/0002-platform-support-tiers.md))
- Client tests: `node test/client.test.mjs` — 75 checks, including locale key parity for every official DSH language
