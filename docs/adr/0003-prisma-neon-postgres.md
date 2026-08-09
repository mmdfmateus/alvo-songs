# Prisma targets Neon Postgres

Production database for Alvo Cifras is **Neon Postgres** accessed with Prisma (`provider = "postgresql"`), typically provisioned via the Vercel Marketplace. Local development uses the **same engine** — Docker Postgres or a Neon branch/dev database — not SQLite and not the slides app’s Drizzle/PGlite stack. PlanetScale/MySQL (alvocifras-style `relationMode`) is rejected: we are not migrating that database, and Song/Trecho/Program relations plus Auth.js `User.isEditor` fit normal Postgres FKs better.
