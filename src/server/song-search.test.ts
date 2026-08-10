import { expect, test } from "vitest";

import { searchSongs } from "~/server/song-search";

test("Postgres search uses portuguese tsvector/tsquery, not ILIKE", async () => {
  let sql = "";
  await searchSongs(
    {
      $queryRaw: (async (strings: TemplateStringsArray) => {
        sql = strings.join("?");
        return [];
      }) as never,
    },
    "coracao",
  );

  expect(sql).toContain("to_tsvector");
  expect(sql).toContain("plainto_tsquery");
  expect(sql).toContain("portuguese");
  expect(sql).toContain("immutable_unaccent");
  expect(sql).not.toMatch(/ILIKE|contains/i);
});
