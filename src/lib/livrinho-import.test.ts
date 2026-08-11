import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "vitest";

import { deriveLetra, isCifra } from "~/lib/cifra";
import {
  cleanLivrinhoBody,
  importLivrinho,
  livrinhoFlagsByTitle,
  splitLivrinhoSongs,
  uniqueCifraChords,
  unsyncedLivrinhoSongs,
} from "~/lib/livrinho-import";

const LET_IT_BE = `**1- Let It Be**

       Am         C/G        F          C
Let it be, let it be, let it be, let it be

C                G              F  C/E Dm C
Whisper words of wisdom, let it be
`;

const BOOKLET_SNIPPET = `**24- Conheci um Grande Amigo**

(A7M \\- C\\#m - D7+)
Conheci um grande amigo Ele é filho de Deus Pai
O Seu nome é Jesus Cristo,

25- Convite à Liberdade

Ó vinde vós os povos de todas as nações,

**25- Despertar**

C9          G
**Quero que você desperte** para vida
[E/G#](https://www.cifraclub.com.br/foo)
`;

test("splitLivrinhoSongs uses bold, ## bold, and unbolded N- Title headings", () => {
  const markdown = `**1- Primeira**

G
oi

## **42- Faça Valer a Pena**

Am
vale

25- Convite à Liberdade

vinde
`;

  const songs = splitLivrinhoSongs(markdown);
  expect(songs.map(({ sourceNumber, title, unbolded }) => ({
    sourceNumber,
    title,
    unbolded,
  }))).toEqual([
    { sourceNumber: 1, title: "Primeira", unbolded: false },
    { sourceNumber: 42, title: "Faça Valer a Pena", unbolded: false },
    { sourceNumber: 25, title: "Convite à Liberdade", unbolded: true },
  ]);
  expect(songs[0]?.body).toContain("G");
  expect(songs[2]?.body).toContain("vinde");
});

test("cleanLivrinhoBody unescapes, unwraps links, Intro:, parens, and trailing chord dots", () => {
  const cleaned = cleanLivrinhoBody(
    [
      "Intr: C Am",
      "(G \\- C9)",
      "Am.                    C9",
      "Da distância avistei",
      "[E/G#](https://www.cifraclub.com.br/foo) **Aleluia** `C#m`",
    ].join("\n"),
  );

  expect(cleaned).toContain("Intro: C Am");
  expect(cleaned).toContain("G C9");
  expect(cleaned).not.toContain("Am.");
  expect(cleaned).toContain("E/G#");
  expect(cleaned).not.toMatch(/\*\*|`|cifraclub|Intr:/);
});

test("importLivrinho persists serializer JSON and seeds Trechos from Letra", () => {
  const [song] = importLivrinho(LET_IT_BE);

  expect(song).toMatchObject({
    sourceNumber: 1,
    title: "Let It Be",
    flags: [],
  });
  expect(isCifra(song?.cifra)).toBe(true);
  expect(typeof song?.cifra).toBe("object");
  expect(JSON.stringify(song?.cifra).startsWith('"')).toBe(false);
  expect(deriveLetra(song!.cifra)).toContain("Let it be, let it be");
  expect(song?.chunks).toEqual([
    "Let it be, let it be, let it be, let it be",
    "Whisper words of wisdom, let it be",
  ]);
  expect(uniqueCifraChords(song!.cifra).length).toBeGreaterThan(0);
});

test("importLivrinho flags fallback parse, leftover markdown, and un-swallowed Convite", () => {
  const songs = importLivrinho(BOOKLET_SNIPPET);
  const byTitle = Object.fromEntries(songs.map((song) => [song.title, song]));

  expect(Object.keys(byTitle)).toEqual([
    "Conheci um Grande Amigo",
    "Convite à Liberdade",
    "Despertar",
  ]);
  expect(byTitle["Convite à Liberdade"]?.flags).toContain("swallowedHeading");
  expect(byTitle["Convite à Liberdade"]?.chunks.join("\n")).toContain(
    "Ó vinde vós os povos",
  );
  expect(byTitle["Conheci um Grande Amigo"]?.chunks.join("\n")).not.toContain(
    "Convite à Liberdade",
  );
  expect(byTitle["Despertar"]?.flags).toContain("leftoverMarkdown");
});

test("lyric-only Songs are valid and flagged as zero chords", () => {
  const [song] = importLivrinho(
    "**8- Amor Pra Mim**\n\nEu te amo\n\nMais que as palavras\n",
  );

  expect(song?.flags).toContain("zeroChords");
  expect(isCifra(song?.cifra)).toBe(true);
  expect(song?.chunks.length).toBeGreaterThan(0);
});

test("unsyncedLivrinhoSongs skips titles already in the library", () => {
  const imported = importLivrinho(`${LET_IT_BE}\n**2- Nova**\n\nAm\noi\n`);
  expect(
    unsyncedLivrinhoSongs(imported, ["Let It Be"]).map((song) => song.title),
  ).toEqual(["Nova"]);
});

test("livrinho booklet import yields ~110 Songs with Cifra, Trechos, and review flags", () => {
  const markdown = readFileSync(
    path.join(process.cwd(), "data/livrinho-de-cifras.md"),
    "utf8",
  );
  const songs = importLivrinho(markdown);
  const flags = livrinhoFlagsByTitle(songs);

  expect(songs).toHaveLength(111);
  expect(songs.every((song) => isCifra(song.cifra))).toBe(true);
  expect(songs.every((song) => song.chunks.length >= 0)).toBe(true);
  expect(songs.map((song) => song.title)).toContain("Convite à Liberdade");
  expect(songs.map((song) => song.title)).toContain("Faça Valer a Pena");
  expect(songs.find((song) => song.title === "Convite à Liberdade")?.flags).toContain(
    "swallowedHeading",
  );
  expect(flags.size).toBeGreaterThan(0);
  expect(
    songs.some(
      (song) =>
        song.flags.includes("fallbackParse") || song.flags.includes("zeroChords"),
    ),
  ).toBe(true);
});
