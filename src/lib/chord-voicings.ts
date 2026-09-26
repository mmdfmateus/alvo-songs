export type FretMark = number | "x";

export type DisplayedChordVoicing = {
  /** Low E → high e. `"x"` is muted; `0` is open. */
  frets: [FretMark, FretMark, FretMark, FretMark, FretMark, FretMark];
};

export function cycleVoicingIndex(count: number, index: number): number {
  if (count <= 1) return index;
  return (index + 1) % count;
}

export function voicingsForDisplayedChord(
  displayedName: string,
): DisplayedChordVoicing[] {
  const label = displayedName.trim();
  if (!label) return [];
  return VOICINGS[canonicalChordKey(label)] ?? [];
}

function canonicalChordKey(name: string): string {
  const slash = name.indexOf("/");
  const head = slash === -1 ? name : name.slice(0, slash);
  const bass = slash === -1 ? "" : name.slice(slash);
  const parsed = /^([A-G](?:#|b)?)(.*)$/.exec(head);
  if (!parsed) return name;
  const root = parsed[1]!;
  let quality = parsed[2]!;
  quality = quality.replace(/m7M/g, "mMaj7");
  quality = quality.replace(/7M/g, "maj7");
  if (quality === "4") quality = "sus4";
  if (quality === "2") quality = "sus2";
  return `${root}${quality}${bass}`;
}

function v(
  e: FretMark,
  a: FretMark,
  d: FretMark,
  g: FretMark,
  b: FretMark,
  highE: FretMark,
): DisplayedChordVoicing {
  return { frets: [e, a, d, g, b, highE] };
}

/** Known standard-tuning shapes only. Unlisted names miss; nothing is generated. */
const VOICINGS: Record<string, DisplayedChordVoicing[]> = {
  C: [v("x", 3, 2, 0, 1, 0), v("x", 3, 5, 5, 5, 3)],
  "C#": [v("x", 4, 6, 6, 6, 4), v(9, 11, 11, 10, 9, 9)],
  Db: [v("x", 4, 6, 6, 6, 4), v(9, 11, 11, 10, 9, 9)],
  D: [v("x", "x", 0, 2, 3, 2), v("x", 5, 7, 7, 7, 5)],
  Eb: [v("x", "x", 1, 3, 4, 3), v("x", 6, 8, 8, 8, 6)],
  "D#": [v("x", "x", 1, 3, 4, 3), v("x", 6, 8, 8, 8, 6)],
  E: [v(0, 2, 2, 1, 0, 0), v(7, 9, 9, 8, 7, 7)],
  F: [v(1, 3, 3, 2, 1, 1), v(8, 10, 10, 10, 8, 8)],
  "F#": [v(2, 4, 4, 3, 2, 2), v(9, 11, 11, 11, 9, 9)],
  Gb: [v(2, 4, 4, 3, 2, 2), v(9, 11, 11, 11, 9, 9)],
  G: [v(3, 2, 0, 0, 0, 3), v(3, 5, 5, 4, 3, 3)],
  "G#": [v(4, 6, 6, 5, 4, 4), v("x", 11, 13, 13, 13, 11)],
  Ab: [v(4, 6, 6, 5, 4, 4), v("x", 11, 13, 13, 13, 11)],
  A: [v("x", 0, 2, 2, 2, 0), v(5, 7, 7, 6, 5, 5)],
  "A#": [v("x", 1, 3, 3, 3, 1), v(6, 8, 8, 7, 6, 6)],
  Bb: [v("x", 1, 3, 3, 3, 1), v(6, 8, 8, 7, 6, 6)],
  B: [v("x", 2, 4, 4, 4, 2), v(7, 9, 9, 8, 7, 7)],

  Cm: [v("x", 3, 5, 5, 4, 3), v(8, 10, 10, 8, 8, 8)],
  "C#m": [v("x", 4, 6, 6, 5, 4), v(9, 11, 11, 9, 9, 9)],
  Dm: [v("x", "x", 0, 2, 3, 1), v("x", 5, 7, 7, 6, 5)],
  Ebm: [v("x", "x", 1, 3, 4, 2), v("x", 6, 8, 8, 7, 6)],
  Em: [v(0, 2, 2, 0, 0, 0), v(7, 9, 9, 7, 7, 7)],
  Fm: [v(1, 3, 3, 1, 1, 1), v(8, 10, 10, 8, 8, 8)],
  "F#m": [v(2, 4, 4, 2, 2, 2), v(9, 11, 11, 9, 9, 9)],
  Gm: [v(3, 5, 5, 3, 3, 3), v("x", 10, 12, 12, 11, 10)],
  Am: [v("x", 0, 2, 2, 1, 0), v(5, 7, 7, 5, 5, 5)],
  Bbm: [v("x", 1, 3, 3, 2, 1), v(6, 8, 8, 6, 6, 6)],
  Bm: [v("x", 2, 4, 4, 3, 2), v(7, 9, 9, 7, 7, 7)],

  C7: [v("x", 3, 2, 3, 1, 0), v("x", 3, 5, 3, 5, 3)],
  D7: [v("x", "x", 0, 2, 1, 2), v("x", 5, 7, 5, 7, 5)],
  E7: [v(0, 2, 0, 1, 0, 0), v(0, 2, 2, 1, 3, 0)],
  F7: [v(1, 3, 1, 2, 1, 1), v(8, 10, 8, 10, 8, 8)],
  G7: [v(3, 2, 0, 0, 0, 1), v(3, 5, 3, 4, 3, 3)],
  A7: [v("x", 0, 2, 0, 2, 0), v(5, 7, 5, 6, 5, 5)],
  B7: [v("x", 2, 1, 2, 0, 2), v("x", 2, 4, 2, 4, 2)],

  Am7: [v("x", 0, 2, 0, 1, 0), v(5, 7, 5, 5, 5, 5)],
  Dm7: [v("x", "x", 0, 2, 1, 1), v("x", 5, 7, 5, 6, 5)],
  Em7: [v(0, 2, 0, 0, 0, 0), v(0, 2, 2, 0, 3, 0)],
  Gm7: [v(3, 5, 3, 3, 3, 3)],
  Bm7: [v("x", 2, 4, 2, 3, 2)],

  Cmaj7: [v("x", 3, 2, 0, 0, 0), v("x", 3, 5, 4, 5, 3)],
  Dmaj7: [v("x", "x", 0, 2, 2, 2), v("x", 5, 7, 6, 7, 5)],
  Fmaj7: [v("x", "x", 3, 2, 1, 0), v(1, 3, 3, 2, 1, 0)],
  Gmaj7: [v(3, 2, 0, 0, 0, 2), v(3, 5, 4, 4, 3, 3)],
  Amaj7: [v("x", 0, 2, 1, 2, 0), v(5, 7, 6, 6, 5, 5)],

  Csus4: [v("x", 3, 3, 0, 1, 1), v("x", 3, 5, 5, 6, 3)],
  Dsus4: [v("x", "x", 0, 2, 3, 3), v("x", 5, 7, 7, 8, 5)],
  Esus4: [v(0, 2, 2, 2, 0, 0), v(7, 9, 9, 9, 7, 7)],
  Fsus4: [v(1, 3, 3, 3, 1, 1), v(8, 10, 10, 10, 8, 8)],
  Gsus4: [v(3, 5, 5, 5, 3, 3), v(3, 3, 0, 0, 1, 3)],
  Asus4: [v("x", 0, 2, 2, 3, 0), v(5, 7, 7, 7, 5, 5)],

  Csus2: [v("x", 3, 0, 0, 1, 3)],
  Dsus2: [v("x", "x", 0, 2, 3, 0)],
  Gsus2: [v(3, 0, 0, 0, 3, 3)],
  Asus2: [v("x", 0, 2, 2, 0, 0)],

  C9: [v("x", 3, 2, 3, 3, 3)],
  D9: [v("x", 5, 4, 5, 5, 5)],
  G9: [v(3, 2, 0, 2, 0, 1)],
  A9: [v("x", 0, 2, 4, 2, 3)],

  Cadd9: [v("x", 3, 2, 0, 3, 0)],
  Dadd9: [v("x", "x", 0, 2, 3, 0)],
  Gadd9: [v(3, 2, 0, 2, 0, 3)],

  C5: [v("x", 3, 5, 5, "x", "x")],
  D5: [v("x", 5, 7, 7, "x", "x")],
  E5: [v(0, 2, 2, "x", "x", "x")],
  G5: [v(3, 5, 5, "x", "x", "x")],
  A5: [v("x", 0, 2, 2, "x", "x")],

  "C/G": [v(3, 3, 2, 0, 1, 0)],
  "C/E": [v(0, 3, 2, 0, 1, 0)],
  "D/F#": [v(2, "x", 0, 2, 3, 2)],
  "G/B": [v("x", 2, 0, 0, 0, 3)],
  "G/D": [v("x", "x", 0, 0, 0, 3)],
  "A/C#": [v("x", 4, 2, 2, 2, 0)],
  "A/E": [v(0, 0, 2, 2, 2, 0)],
  "F/C": [v("x", 3, 3, 2, 1, 1)],
  "F/A": [v("x", 0, 3, 2, 1, 1)],
  "Am/G": [v(3, 0, 2, 2, 1, 0)],
  "Am/E": [v(0, 0, 2, 2, 1, 0)],
  "D/A": [v("x", 0, 0, 2, 3, 2)],
  "E/G#": [v(4, 2, 2, 1, 0, 0)],
  "Em/B": [v("x", 2, 2, 0, 0, 0)],
};
