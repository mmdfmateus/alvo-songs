# Prisma data model for library + Programs

Neon Postgres (ADR 0003) holds Auth.js identity, the Song library, and unlisted Programs. The locked shape is enough to implement without inventing tables: Auth.js `User` / `Account` / `Session` / `VerificationToken` plus domain `Artist`, `Song`, `LyricChunk`, `Program`, and `Section`. There is no `Slide`, `Playlist`, `Role`, or `Editor` table; Letra is never stored; Program ownership is a hashed secret on `Program`, not a User FK (ADR 0001, ADR 0002).

**Auth:** standard Auth.js Prisma adapter models. `User.isEditor Boolean @default(false)` is the allowlist (ADR 0002). Google sign-in only for v1 — no WebAuthn `Authenticator` model.

**Artist:** `id`, `name`, optional `imageUrl` (URL string; upload provider still fog), timestamps. Optional on Song.

**Song:** `id`, `title`, `cifra Json` (ChordSheetJS `ChordSheetSerializer` output — the only stored original), optional `artistId` → Artist (`onDelete: SetNull`), optional `videoId` (YouTube), optional `sourceNumber` (livrinho seed traceability), ordered `lyricChunks`, timestamps. No `lyrics` / Letra column — Letra is derived from `cifra` at read time. Name the field `cifra`, not `chords`.

**LyricChunk** (UI: Trecho): `id`, `songId` → Song (`onDelete: Cascade`), `position Int`, `text`, unique `(songId, position)`. Seeded once from derived Letra on create/import; later Cifra saves do not rewrite rows (ADR 0005).

**Program:** `id` (public share URL id), `name`, `ownerTokenHash` (hash of the secret placed in the long-lived ownership cookie on create), timestamps. No gallery flag, no User owner. Device-local “Meus slides” is client storage, not a table.

**Section:** `id`, `programId` → Program (`onDelete: Cascade`), `position Int`, `type` (`opening` | `song` | `announcements` | `game` | `moment`), optional `songId` → Song (`onDelete: SetNull`) used only for type `song` (live library reference — ADR 0004), `payload Json` for type-specific fields, unique `(programId, position)`. Payload keys: opening `{ communityName, subtitle? }`; announcements `{ title, blankCount }`; game `{ title, label?, blankCount }`; moment `{ label }`; song sections rely on `songId` (payload empty/`{}`). Missing Song after delete → `songId` null → broken reference / no lyric slides at Export. No persisted Slide rows — Export expands Sections in memory.

**Rejected:** copying Alvo Cifras’ required Artist + dual `chords`/`lyrics` JSON; PlanetScale/`relationMode`; storing Trechos or title snapshots on Song sections; Program→User ownership; env-only editor allowlist; a blank-count-free schema that cannot express CONTEXT’s N blank Slides for Recados/Brincadeira.

Illustrative Prisma (Auth.js models abbreviated to the `User.isEditor` delta; keep the adapter’s `Account` / `Session` / `VerificationToken` as create.t3.gg documents):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  isEditor      Boolean   @default(false)
  accounts      Account[]
  sessions      Session[]
}

model Artist {
  id        String   @id @default(cuid())
  name      String
  imageUrl  String?
  songs     Song[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Song {
  id           String       @id @default(cuid())
  title        String
  cifra        Json
  videoId      String?
  sourceNumber Int?
  artistId     String?
  artist       Artist?      @relation(fields: [artistId], references: [id], onDelete: SetNull)
  lyricChunks  LyricChunk[]
  sections     Section[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([artistId])
}

model LyricChunk {
  id       String @id @default(cuid())
  songId   String
  song     Song   @relation(fields: [songId], references: [id], onDelete: Cascade)
  position Int
  text     String

  @@unique([songId, position])
  @@index([songId])
}

model Program {
  id             String    @id @default(cuid())
  name           String
  ownerTokenHash String
  sections       Section[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Section {
  id        String  @id @default(cuid())
  programId String
  program   Program @relation(fields: [programId], references: [id], onDelete: Cascade)
  position  Int
  type      String // opening | song | announcements | game | moment
  songId    String?
  song      Song?   @relation(fields: [songId], references: [id], onDelete: SetNull)
  payload   Json    @default("{}")

  @@unique([programId, position])
  @@index([programId])
  @@index([songId])
}
```
