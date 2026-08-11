import { readFileSync } from "node:fs";
import path from "node:path";

import ChordSheetJS from "chordsheetjs";

import { deriveLetra, isCifra, seedLyricChunks, type Cifra } from "~/lib/cifra";

export const LIVRINHO_MARKDOWN_PATH = path.join(
  process.cwd(),
  "data/livrinho-de-cifras.md",
);

export const LIVRINHO_FLAGS = [
  "fallbackParse",
  "zeroChords",
  "leftoverMarkdown",
  "swallowedHeading",
] as const;

export type LivrinhoFlag = (typeof LIVRINHO_FLAGS)[number];

export const LIVRINHO_FLAG_LABEL: Record<LivrinhoFlag, string> = {
  fallbackParse: "Parse fallback",
  zeroChords: "Sem acordes",
  leftoverMarkdown: "Markdown residual",
  swallowedHeading: "Título sem negrito",
};

export type ImportedSong = {
  sourceNumber: number;
  title: string;
  cifra: Cifra;
  chunks: string[];
  flags: LivrinhoFlag[];
};

const TITLE_RE = /^\*\*(\d+)-\s*(.+?)\*\*\s*$/;
const TITLE_RE2 = /^##\s*\*\*(\d+)-\s*(.+?)\*\*\s*$/;
const TITLE_UNBOLDED_RE = /^(\d+)-\s+(.+)$/;

const CHORD_TOKEN =
  /^[A-G](?:#|b)?(?:maj|min|dim|aug|sus|add|m|M)?(?:[0-9]+)?(?:\/(?:[A-G](?:#|b)?))?$/;

const MARKDOWN_LEFTOVER = /\*\*|`|\]\(\s*https?:\/\/|cifraclub/i;

type TitleMatch = {
  index: number;
  sourceNumber: number;
  title: string;
  unbolded: boolean;
};

export function readLivrinhoMarkdown(
  filePath = LIVRINHO_MARKDOWN_PATH,
): string {
  return readFileSync(filePath, "utf8");
}

let cachedImport: ImportedSong[] | undefined;

export function loadImportedLivrinho(): ImportedSong[] {
  cachedImport ??= importLivrinho(readLivrinhoMarkdown());
  return cachedImport;
}

function createCowParser() {
  return new ChordSheetJS.ChordsOverWordsParser();
}

function createSheetParser() {
  return new ChordSheetJS.ChordSheetParser();
}

function createSerializer() {
  return new ChordSheetJS.ChordSheetSerializer();
}

export function importLivrinho(markdown: string): ImportedSong[] {
  const cowParser = createCowParser();
  const sheetParser = createSheetParser();
  const serializer = createSerializer();

  return splitLivrinhoSongs(markdown).map((section) => {
    const cleaned = cleanLivrinhoBody(section.body);
    const { cifra, fallback } = parseLivrinhoCifra(
      cleaned,
      cowParser,
      sheetParser,
      serializer,
    );
    const flags = flagsForSection({
      unbolded: section.unbolded,
      originalBody: section.body,
      cifra,
      fallback,
    });

    return {
      sourceNumber: section.sourceNumber,
      title: section.title,
      cifra,
      chunks: seedLyricChunks(deriveLetra(cifra)),
      flags,
    };
  });
}

export function livrinhoFlagsByTitle(
  songs: ImportedSong[],
): Map<string, LivrinhoFlag[]> {
  return new Map(
    songs
      .filter((song) => song.flags.length > 0)
      .map((song) => [song.title, song.flags]),
  );
}

export function unsyncedLivrinhoSongs(
  imported: ImportedSong[],
  existingTitles: Iterable<string>,
): ImportedSong[] {
  const present = new Set(existingTitles);
  return imported.filter((song) => !present.has(song.title));
}

export function uniqueCifraChords(cifra: Cifra): string[] {
  const chords = new Set<string>();
  for (const line of cifra.lines) {
    for (const item of line.items) {
      const token = item.chords?.trim();
      if (token) chords.add(token);
    }
  }
  return [...chords];
}

export function splitLivrinhoSongs(markdown: string): {
  sourceNumber: number;
  title: string;
  body: string;
  unbolded: boolean;
}[] {
  const text = normalizeBookletChars(markdown);
  const matches = findTitleMatches(text);

  return matches.map((match, index) => {
    const end = matches[index + 1]?.index ?? text.length;
    const bodyStart = text.indexOf("\n", match.index);
    const body =
      bodyStart === -1 || bodyStart >= end
        ? ""
        : text.slice(bodyStart + 1, end);
    return {
      sourceNumber: match.sourceNumber,
      title: match.title,
      body,
      unbolded: match.unbolded,
    };
  });
}

export function cleanLivrinhoBody(body: string): string {
  let text = normalizeBookletChars(body);
  text = text.replace(/\[([^\]]+)\]\(\s*https?:\/\/[^)]+\)/g, "$1");
  text = text.replace(/`+/g, "");
  text = text.replace(/\*\*/g, "");
  text = text.replace(/\*/g, "");
  text = text.replace(/^(Intr\.?|Passagem|Solo|Riff)\s*:?/gim, "Intro:");
  text = unwrapProgressionParens(text);
  text = text.replace(
    /\b([A-G](?:#|b)?(?:maj|min|dim|aug|sus|add|m|M)?(?:[0-9]+)?(?:\/(?:[A-G](?:#|b)?))?)\.(?=\s|$)/g,
    "$1",
  );

  return text
    .split("\n")
    .filter((line) => line.trim() !== "##")
    .map((line) => (isGuitarTabLine(line) ? "" : line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeBookletChars(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\\-/g, "-")
    .replace(/\\!/g, "!")
    .replace(/\\#/g, "#");
}

function findTitleMatches(text: string): TitleMatch[] {
  const matches: TitleMatch[] = [];

  for (const [index, line] of text.split("\n").entries()) {
    const offset = lineOffset(text, index);
    const heading =
      line.match(TITLE_RE2) ?? line.match(TITLE_RE) ?? line.match(TITLE_UNBOLDED_RE);
    if (!heading) continue;

    matches.push({
      index: offset,
      sourceNumber: Number(heading[1]),
      title: cleanTitle(heading[2] ?? ""),
      unbolded: TITLE_UNBOLDED_RE.test(line) && !TITLE_RE.test(line) && !TITLE_RE2.test(line),
    });
  }

  return matches;
}

function lineOffset(text: string, lineIndex: number): number {
  if (lineIndex === 0) return 0;
  const lines = text.split("\n");
  let offset = 0;
  for (let i = 0; i < lineIndex; i += 1) {
    offset += (lines[i]?.length ?? 0) + 1;
  }
  return offset;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\*+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapProgressionParens(text: string): string {
  return text.replace(/\(([^)\n]+)\)/g, (full, inner: string) => {
    const parts = inner
      .replace(/\./g, "")
      .split(/[\s\-–—]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return full;
    const chordish = parts.filter(
      (part) => isChordToken(part) || /^x\d$/i.test(part),
    );
    if (chordish.length >= Math.max(1, parts.length * 0.7)) {
      return chordish.filter((part) => isChordToken(part)).join(" ");
    }
    return full;
  });
}

function isChordToken(token: string): boolean {
  return CHORD_TOKEN.test(token);
}

function isGuitarTabLine(line: string): boolean {
  const trimmed = line.trim();
  return /^[eEADGBeb]\|[-0-9xX|hpb/\\]+$/.test(trimmed);
}

function parseLivrinhoCifra(
  cleaned: string,
  cowParser: ReturnType<typeof createCowParser>,
  sheetParser: ReturnType<typeof createSheetParser>,
  serializer: ReturnType<typeof createSerializer>,
): { cifra: Cifra; fallback: boolean } {
  try {
    const song = cowParser.parse(cleaned);
    return { cifra: serializeCifra(serializer, song), fallback: false };
  } catch {
    const song = sheetParser.parse(cleaned, {
      song: new ChordSheetJS.Song(),
    });
    return { cifra: serializeCifra(serializer, song), fallback: true };
  }
}

function serializeCifra(
  serializer: ReturnType<typeof createSerializer>,
  song: Parameters<ReturnType<typeof createSerializer>["serialize"]>[0],
): Cifra {
  const serialized = serializer.serialize(song);
  if (!isCifra(serialized)) {
    throw new Error("Livrinho parse did not produce serializer JSON");
  }
  return serialized;
}

function flagsForSection(input: {
  unbolded: boolean;
  originalBody: string;
  cifra: Cifra;
  fallback: boolean;
}): LivrinhoFlag[] {
  const flags: LivrinhoFlag[] = [];
  if (input.fallback) flags.push("fallbackParse");
  if (uniqueCifraChords(input.cifra).length === 0) flags.push("zeroChords");
  if (MARKDOWN_LEFTOVER.test(input.originalBody)) flags.push("leftoverMarkdown");
  if (input.unbolded) flags.push("swallowedHeading");
  return flags;
}
