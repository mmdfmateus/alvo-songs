export type Cifra = {
  type: "chordSheet";
  lines: {
    type: "line";
    items: { type: string; chords?: string; lyrics?: string | null }[];
  }[];
};

export type CifraViewPart = { chords: string; lyrics: string };
export type CifraViewLine = { parts: CifraViewPart[] };

export function isCifra(value: unknown): value is Cifra {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { type?: unknown; lines?: unknown };
  return record.type === "chordSheet" && Array.isArray(record.lines);
}

export function deriveLetra(cifra: unknown): string {
  if (!isCifra(cifra)) return "";

  const lines: string[] = [];
  for (const line of cifra.lines) {
    const pairs = line.items.filter((item) => item.type === "chordLyricsPair");
    if (pairs.length === 0) {
      lines.push("");
      continue;
    }

    const lyrics = pairs.map((item) => item.lyrics ?? "").join("");
    if (!lyrics.trim()) continue;
    lines.push(lyrics.replace(/\s+$/, ""));
  }

  return lines.join("\n").replace(/^\n+|\n+$/g, "");
}

export function cifraViewLines(cifra: unknown): CifraViewLine[] {
  if (!isCifra(cifra)) return [];

  return cifra.lines.map((line) => ({
    parts: line.items
      .filter((item) => item.type === "chordLyricsPair")
      .map((item) => ({
        chords: item.chords ?? "",
        lyrics: item.lyrics ?? "",
      })),
  }));
}

/** Seed lyric chunks from Letra: blank-line paragraphs, else ~4-line fallback. */
export function seedLyricChunks(letra: string): string[] {
  const paragraphs = letra
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  if (paragraphs.length === 0) return [];

  if (paragraphs.length === 1) {
    const lines = paragraphs[0]!.split("\n");
    if (lines.length >= 5) {
      const chunks: string[] = [];
      for (let i = 0; i < lines.length; i += 4) {
        chunks.push(lines.slice(i, i + 4).join("\n"));
      }
      return chunks;
    }
  }

  return paragraphs;
}
