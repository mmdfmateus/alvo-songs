# Handoff: sync wayfinder map Decisions so far

## Goal

Update GitHub issue [#1 Alvo Cifras spec](https://github.com/mmdfmateus/alvo-songs/issues/1) so **Decisions so far** includes closed tickets **#5–#7**. Those issues are already closed; ADRs are on `master`. The previous agent’s token could push/merge PRs but got **403** on issue edit/comment.

## Do this

1. Edit issue **#1** body.
2. Under `## Decisions so far`, **after** the `#4` (Cifra editor input format) bullet, append:

```markdown
- [Programas discoverability and editing](https://github.com/mmdfmateus/alvo-songs/issues/5) — link-only Programs; long-lived cookie ownership for edit/delete; view URL is read-only + export; device-local Meus programas; Editors have no Program powers ([ADR 0001](https://github.com/mmdfmateus/alvo-songs/blob/master/docs/adr/0001-program-link-only-cookie-ownership.md)).
- [Editor allowlist storage](https://github.com/mmdfmateus/alvo-songs/issues/6) — User.isEditor boolean; any Google may sign in; mutate re-checks flag; flip column in DB for v1 ([ADR 0002](https://github.com/mmdfmateus/alvo-songs/blob/master/docs/adr/0002-editor-is-user-flag.md)).
- [Prisma database host](https://github.com/mmdfmateus/alvo-songs/issues/7) — Neon Postgres for Prisma in prod; local Postgres (Docker or Neon branch); not PlanetScale/MySQL or slides PGlite ([ADR 0003](https://github.com/mmdfmateus/alvo-songs/blob/master/docs/adr/0003-prisma-neon-postgres.md)).
```

3. Do **not** change Destination / Notes / Not yet specified / Out of scope unless something is clearly wrong.
4. Verify with `gh issue view 1` that the three lines appear and link correctly.

## If you have Issues write

```bash
# body already prepared pattern: read current body, splice after #4 line, then:
gh issue edit 1 --body-file <updated-body.md>
```

## Done when

Map **Decisions so far** lists #2–#7 in order; #5–#7 gists match the bullets above.

## Next frontier (do not start unless asked)

First unblocked open tickets after the map is synced: **#8 Program export: live Song or snapshot**, then #9, #10 (IA; was blocked on #5). Skills: `/grilling` + `/domain-modeling`. Never resolve more than one ticket per session. Claim with assignee if the token allows.
