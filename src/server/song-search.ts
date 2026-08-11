import type { PrismaClient } from "@prisma/client";

export type SongSearchHit = {
  id: string;
  title: string;
  artist: { id: string; name: string } | null;
};

export function foldSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function fieldTokens(value: string) {
  return foldSearchText(value).split(/\s+/).filter(Boolean);
}

export function tokensMatchField(field: string, q: string) {
  const queryTokens = fieldTokens(q);
  if (queryTokens.length === 0) return false;
  const haystack = fieldTokens(field);
  return queryTokens.every((token) => haystack.includes(token));
}

export function songMatchesSearch(
  title: string,
  artistName: string | null | undefined,
  q: string,
  lyrics?: string,
) {
  return (
    tokensMatchField(title, q) ||
    Boolean(artistName && tokensMatchField(artistName, q)) ||
    Boolean(lyrics && tokensMatchField(lyrics, q))
  );
}

type SearchDb = {
  searchSongs?: (q: string) => Promise<SongSearchHit[]>;
  $queryRaw?: PrismaClient["$queryRaw"];
};

export async function searchSongs(
  db: SearchDb,
  q: string,
): Promise<SongSearchHit[]> {
  if (db.searchSongs) return db.searchSongs(q);
  if (!db.$queryRaw) {
    throw new Error("Song search requires Postgres full-text search");
  }

  const rows = await db.$queryRaw<
    {
      id: string;
      title: string;
      artistId: string | null;
      artistName: string | null;
    }[]
  >`
    SELECT
      s.id,
      s.title,
      a.id AS "artistId",
      a.name::text AS "artistName"
    FROM "Song" s
    LEFT JOIN "Artist" a ON a.id = s."artistId"
    WHERE
      to_tsvector('portuguese', immutable_unaccent(s.title))
        @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
      OR (
        a.id IS NOT NULL
        AND to_tsvector('portuguese', immutable_unaccent(a.name::text))
          @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
      )
      OR EXISTS (
        SELECT 1
        FROM "LyricChunk" c
        WHERE
          c."songId" = s.id
          AND to_tsvector('portuguese', immutable_unaccent(c.text))
            @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
      )
    ORDER BY
      ts_rank_cd(
        to_tsvector('portuguese', immutable_unaccent(s.title))
          || coalesce(
            to_tsvector('portuguese', immutable_unaccent(a.name::text)),
            ''::tsvector
          )
          || coalesce(
            (
              SELECT to_tsvector(
                'portuguese',
                immutable_unaccent(string_agg(c.text, ' '))
              )
              FROM "LyricChunk" c
              WHERE c."songId" = s.id
            ),
            ''::tsvector
          ),
        plainto_tsquery('portuguese', immutable_unaccent(${q}))
      ) DESC,
      s.title ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    artist:
      row.artistId && row.artistName
        ? { id: row.artistId, name: row.artistName }
        : null,
  }));
}
