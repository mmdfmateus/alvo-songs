# Prisma data model for library + Programs

V1 persists the locked glossary on Neon Postgres (ADR 0003): Auth.js adapter tables plus `User.isEditor` (ADR 0002); Artist optional on Song; Cifra as ChordSheetJS serializer JSON (Letra is not stored); Trechos as their own rows, independent after seed (ADR 0005); Programs unlisted with cookie ownership (ADR 0001) via `ownerTokenHash` — no Program↔User FK; Song sections store only a live `songId` (ADR 0004). `Section.songId` is **not** a foreign key so deleting a Song leaves a dangling id for broken-ref UI (Restrict would block library cleanup; Cascade would silently edit other people’s Programs; SetNull forgets which Song died). Artist delete SetNulls `Song.artistId`. Rejected: Playlists, a Letra column, jsonb Trechos, snapshot fields on Song sections, Program slugs, `sourceNumber`, a Postgres enum for section type, and tying Programs to Google accounts.

Enable the `citext` extension so `Artist.name` is unique case-insensitively. Domain ids are uuid (Program uuid is the public view URL); Auth.js ids stay cuid. Meus slides is device-local storage, not a DB query. Cookie holds the owner secret; DB stores only its hash.

Canonical sketch (implement without inventing columns):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
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

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Artist {
  id        String   @id @default(uuid())
  name      String   @unique @db.Citext
  imageUrl  String?
  songs     Song[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Song {
  id        String       @id @default(uuid())
  title     String
  cifra     Json
  artistId  String?
  artist    Artist?      @relation(fields: [artistId], references: [id], onDelete: SetNull)
  videoId   String?
  chunks    LyricChunk[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([artistId])
}

model LyricChunk {
  id       String @id @default(uuid())
  songId   String
  song     Song   @relation(fields: [songId], references: [id], onDelete: Cascade)
  position Int
  text     String

  @@unique([songId, position])
  @@index([songId])
}

model Program {
  id             String    @id @default(uuid())
  name           String
  ownerTokenHash String    @unique
  sections       Section[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Section {
  id        String   @id @default(uuid())
  programId String
  program   Program  @relation(fields: [programId], references: [id], onDelete: Cascade)
  position  Int
  /// opening | song | announcements | game | moment
  type      String
  /// Live Song ref; no FK — dangling id is the ADR 0004 broken-ref state. Null ok even when type is song.
  songId    String?
  payload   Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([programId, position])
  @@index([programId])
}
```

**v1 `Section.payload`:** opening `{ communityName, subtitle? }`; song → empty (id is the column); announcements / game / moment `{ title }`. Blank count is an app constant (1), not stored. No game `label`. `cifra` is the ChordSheetJS serializer **object**, not a double-encoded string and not nullable (empty `chordSheet` is fine). Empty Trecho `text` is allowed; zero chunks are allowed.
