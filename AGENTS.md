# Alvo Cifras

## Agent skills

### Issue tracker

GitHub Issues via `gh`; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Stack

T3 via create-t3-app (App Router). Canonical docs: [create.t3.gg](https://create.t3.gg/en/introduction) — not training-data T3 layouts. See `docs/agents/t3.md`.

### Git

Always commit on a branch, push, and open a PR. Do not leave work local-only; do not ask whether to push; do not commit directly to `master`.
