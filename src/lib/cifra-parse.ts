import ChordSheetJS from "chordsheetjs";

import { isCifra, type Cifra } from "~/lib/cifra";

export function parseCifra(cowText: string): Cifra {
  const song = new ChordSheetJS.ChordsOverWordsParser().parse(cowText);
  const serialized = new ChordSheetJS.ChordSheetSerializer().serialize(song);
  if (!isCifra(serialized)) {
    throw new Error("Cifra parse did not produce serializer JSON");
  }
  return serialized;
}

/** Reconstruct chords-over-words paste from stored Cifra (not ChordPro). */
export function cifraToCow(cifra: unknown): string {
  if (!isCifra(cifra)) return "";
  const song = new ChordSheetJS.ChordSheetSerializer().deserialize(
    cifra as Parameters<
      InstanceType<typeof ChordSheetJS.ChordSheetSerializer>["deserialize"]
    >[0],
  );
  return new ChordSheetJS.TextFormatter().format(song).replace(/\s+$/, "");
}
