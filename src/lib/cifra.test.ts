import { expect, test } from "vitest";

import { cifraToCow, parseCifra } from "~/lib/cifra-parse";
import { deriveLetra, seedLyricChunks } from "~/lib/cifra";

const LET_IT_BE = `       Am         C/G        F          C
Let it be, let it be, let it be, let it be

C                G              F  C/E Dm C
Whisper words of wisdom, let it be`;

test("parseCifra stores serializer JSON, not a double-encoded string", () => {
  const cifra = parseCifra(LET_IT_BE);

  expect(typeof cifra).toBe("object");
  expect(cifra.type).toBe("chordSheet");
  expect(Array.isArray(cifra.lines)).toBe(true);
  expect(JSON.stringify(cifra).startsWith('"')).toBe(false);
});

test("deriveLetra omits chords and keeps the paragraph break", () => {
  expect(deriveLetra(parseCifra(LET_IT_BE))).toBe(
    [
      "Let it be, let it be, let it be, let it be",
      "",
      "Whisper words of wisdom, let it be",
    ].join("\n"),
  );
});

test("re-edit reconstructs chords-over-words, not ChordPro", () => {
  const cow = cifraToCow(parseCifra(LET_IT_BE));

  expect(cow).toContain("Let it be, let it be");
  expect(cow).toMatch(/\bAm\b/);
  expect(cow).not.toMatch(/\[Am\]/);
  expect(cow).not.toMatch(/\{title:/);
});

test("seedLyricChunks splits Letra on blank-line paragraphs", () => {
  expect(
    seedLyricChunks(
      "Let it be, let it be, let it be, let it be\n\nWhisper words of wisdom, let it be",
    ),
  ).toEqual([
    "Let it be, let it be, let it be, let it be",
    "Whisper words of wisdom, let it be",
  ]);
});

test("seedLyricChunks falls back to ~4-line chunks when there is one long paragraph", () => {
  expect(
    seedLyricChunks(
      ["um", "dois", "três", "quatro", "cinco", "seis", "sete"].join("\n"),
    ),
  ).toEqual(["um\ndois\ntrês\nquatro", "cinco\nseis\nsete"]);
});

test("empty Letra seeds zero lyric chunks", () => {
  expect(seedLyricChunks("")).toEqual([]);
  expect(seedLyricChunks("   \n\n  ")).toEqual([]);
});
