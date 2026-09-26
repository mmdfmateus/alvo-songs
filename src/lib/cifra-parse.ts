import ChordSheetJS from "chordsheetjs";

import { isCifra, type Cifra } from "~/lib/cifra";

type SerializedSong = Parameters<
  InstanceType<typeof ChordSheetJS.ChordSheetSerializer>["deserialize"]
>[0];

function deserializeCifra(cifra: Cifra) {
  return new ChordSheetJS.ChordSheetSerializer().deserialize(
    structuredClone(cifra) as SerializedSong,
  );
}

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
  const song = deserializeCifra(cifra);
  return new ChordSheetJS.TextFormatter().format(song).replace(/\s+$/, "");
}

/** Session reading copy: transpose a deserialized Cifra without rewriting storage. */
export function transposeCifra(cifra: unknown, semitones: number): Cifra {
  if (!isCifra(cifra)) {
    return { type: "chordSheet", lines: [] };
  }
  if (semitones === 0) {
    return cifra;
  }

  const serialized = new ChordSheetJS.ChordSheetSerializer().serialize(
    deserializeCifra(cifra).transpose(semitones),
  );
  if (!isCifra(serialized)) {
    throw new Error("Cifra transpose did not produce serializer JSON");
  }
  return serialized;
}
