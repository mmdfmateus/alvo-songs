import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { SongReadTabs } from "~/app/(biblioteca)/musicas/_components/song-read-tabs";
import { parseCifra } from "~/lib/cifra-parse";

const LET_IT_BE = `       Am         C/G        F          C
Let it be, let it be, let it be, let it be`;

const storedLetra = "Let it be, let it be, let it be, let it be";

test("Cifra tab hides Tom controls behind a disclosure", () => {
  const html = renderToStaticMarkup(
    createElement(SongReadTabs, {
      cifra: parseCifra(LET_IT_BE),
      letra: storedLetra,
    }),
  );

  expect(html).toContain("<details");
  expect(html).not.toMatch(/<details[^>]*\sopen/);
  expect(html).toContain("Tom");
  expect(html).toContain("Diminuir tom");
  expect(html).toContain("Aumentar tom");
  expect(html).toContain("Restaurar tom original");
  expect(html).toContain("Am");
  expect(html).not.toContain("Bm");
});

test("Letra is the stored reading, not shown as the Cifra Tom toolbar target", () => {
  const html = renderToStaticMarkup(
    createElement(SongReadTabs, {
      cifra: parseCifra(LET_IT_BE),
      letra: storedLetra,
      videoId: "abc123",
    }),
  );

  expect(html).toContain("Escutar");
  expect(html).not.toContain("youtube-nocookie");
  expect(html).toContain("aria-label=\"Tom\"");
});
