# Alvo Cifras

Alvo Cifras: song catalog (cifras + letras) and COMU program slides builder.

**Spec (v1):** [`docs/prd/v1.md`](docs/prd/v1.md) · **Glossary:** [`CONTEXT.md`](CONTEXT.md) · **Decisions:** [`docs/adr/`](docs/adr/)

## Dev

T3 App Router + Prisma on Postgres. Local DB is the same engine as production (Docker Postgres or a Neon branch) — not SQLite.

```bash
cp .env.example .env   # AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
./start-database.sh
pnpm db:migrate
pnpm db:seed   # livrinho → ~110 Songs (Artist unset; flagged rows in Revisar)
pnpm dev
```

Any Google account may sign in. Flip `User.isEditor` in the database for editor chrome — there is no promote UI. Mutate procedures re-check the flag on every call.

```bash
pnpm test
pnpm typecheck
```
