export type GuitarStringFret = number | null;

export type GuitarVoicingStrings = [
  GuitarStringFret,
  GuitarStringFret,
  GuitarStringFret,
  GuitarStringFret,
  GuitarStringFret,
  GuitarStringFret,
];

export type GuitarVoicingHit = {
  ok: true;
  label: string;
  /** Low E → high e, standard tuning. `null` is muted; `0` is open. */
  strings: GuitarVoicingStrings;
};

export type GuitarVoicingMiss = {
  ok: false;
  label: string;
};

export type GuitarVoicingLookup = GuitarVoicingHit | GuitarVoicingMiss;

type Quality =
  | "major"
  | "minor"
  | "7"
  | "m7"
  | "maj7"
  | "mmaj7"
  | "9"
  | "m9"
  | "6"
  | "m6"
  | "sus4"
  | "sus2"
  | "add9"
  | "aug"
  | "dim"
  | "5"
  | "m7b5"
  | "11"
  | "m11"
  | "13"
  | "7sus4";

type ParsedChord = {
  root: string;
  quality: Quality;
  bass: string | null;
};

const NOTE = /^[A-G][#b]?$/;

const QUALITY_BY_SUFFIX: Record<string, Quality> = {
  "": "major",
  M: "major",
  m: "minor",
  min: "minor",
  "7": "7",
  m7: "m7",
  maj7: "maj7",
  mmaj7: "mmaj7",
  "9": "9",
  m9: "m9",
  "6": "6",
  m6: "m6",
  sus4: "sus4",
  sus2: "sus2",
  "2": "add9",
  add9: "add9",
  add2: "add9",
  aug: "aug",
  dim: "dim",
  "5": "5",
  m7b5: "m7b5",
  "11": "11",
  m11: "m11",
  "13": "13",
  "7sus4": "7sus4",
};

/** Compact fret encoding: `x` muted, `0-9` fret, `a`/`b`/`c` = 10/11/12. */
const OPEN: Record<string, string> = {
  C: "x32010",
  "C#": "x46664",
  Db: "x46664",
  D: "xx0232",
  "D#": "x68886",
  Eb: "x68886",
  E: "022100",
  F: "133211",
  "F#": "244322",
  Gb: "244322",
  G: "320003",
  "G#": "466544",
  Ab: "466544",
  A: "x02220",
  "A#": "x13331",
  Bb: "x13331",
  B: "x24442",

  Cm: "x35543",
  "C#m": "x46654",
  Dbm: "x46654",
  Dm: "xx0231",
  "D#m": "x68876",
  Ebm: "x68876",
  Em: "022000",
  Fm: "133111",
  "F#m": "244222",
  Gbm: "244222",
  Gm: "355333",
  "G#m": "466444",
  Abm: "466444",
  Am: "x02210",
  "A#m": "x13321",
  Bbm: "x13321",
  Bm: "x24432",

  C7: "x32310",
  D7: "xx0212",
  E7: "020100",
  F7: "131211",
  G7: "320001",
  A7: "x02020",
  B7: "x21202",

  Cmaj7: "x32000",
  Dmaj7: "xx0222",
  Emaj7: "021100",
  Fmaj7: "133210",
  Gmaj7: "320002",
  Amaj7: "x02120",
  Bmaj7: "x24342",

  Am7: "x02010",
  Dm7: "xx0211",
  Em7: "020000",
  Fm7: "131111",
  Gm7: "353333",
  Bm7: "x24232",
  Cm7: "x35343",

  C9: "x32330",
  D9: "x54550",
  E9: "020102",
  G9: "300001",
  A9: "x02423",

  C6: "x32210",
  D6: "xx0202",
  E6: "022120",
  G6: "320000",
  A6: "x02222",

  Csus4: "x33011",
  Dsus4: "xx0233",
  Esus4: "022200",
  Fsus4: "133311",
  Gsus4: "330013",
  Asus4: "x02230",
  Bsus4: "x24452",

  Cadd9: "x32030",
  Dadd9: "x00230",
  Gadd9: "320203",
  Aadd9: "x02200",

  C5: "x355xx",
  D5: "x577xx",
  E5: "022xxx",
  F5: "133xxx",
  G5: "355xxx",
  A5: "x022xx",
  B5: "x244xx",

  "C/G": "332010",
  "C/E": "032010",
  "C/D": "xx0010",
  "G/B": "x20003",
  "G/D": "xx0003",
  "G/F": "120003",
  "G/F#": "220003",
  "D/F#": "200232",
  "D/A": "x00232",
  "D/C#": "x40232",
  "D/E": "000232",
  "F/A": "x03211",
  "F/C": "x33211",
  "Am/G": "302210",
  "Am/E": "002210",
  "Am/D": "xx0210",
  "A/E": "002220",
  "A/G#": "402220",
  "E/G#": "422100",
  "E/B": "x22100",
  "E/D": "xx0100",
  "E/A": "x02100",
  "Bm/F#": "224432",
};

const E_SHAPE: Record<Quality, GuitarVoicingStrings | null> = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  "7": [0, 2, 0, 1, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  maj7: [0, 2, 1, 1, 0, 0],
  mmaj7: [0, 2, 1, 0, 0, 0],
  "9": [0, 2, 0, 1, 0, 2],
  m9: [0, 2, 0, 0, 0, 2],
  "6": [0, 2, 2, 1, 2, 0],
  m6: [0, 2, 2, 0, 2, 0],
  sus4: [0, 2, 2, 2, 0, 0],
  sus2: [0, 2, 2, 0, 0, 2],
  add9: [0, 2, 2, 1, 0, 2],
  aug: [0, 3, 2, 1, 1, 0],
  dim: [0, 1, 2, 0, 2, 0],
  "5": [0, 2, 2, null, null, null],
  m7b5: [0, 1, 2, 0, 2, 0],
  "11": [0, 2, 0, 2, 0, 0],
  m11: [0, 2, 0, 2, 0, 0],
  "13": [0, 2, 0, 1, 2, 2],
  "7sus4": [0, 2, 0, 2, 0, 0],
};

const A_SHAPE: Record<Quality, GuitarVoicingStrings | null> = {
  major: [null, 0, 2, 2, 2, 0],
  minor: [null, 0, 2, 2, 1, 0],
  "7": [null, 0, 2, 0, 2, 0],
  m7: [null, 0, 2, 0, 1, 0],
  maj7: [null, 0, 2, 1, 2, 0],
  mmaj7: [null, 0, 2, 1, 1, 0],
  "9": [null, 0, 2, 4, 2, 3],
  m9: [null, 0, 2, 4, 1, 3],
  "6": [null, 0, 2, 2, 2, 2],
  m6: [null, 0, 2, 2, 1, 2],
  sus4: [null, 0, 2, 2, 3, 0],
  sus2: [null, 0, 2, 2, 0, 0],
  add9: [null, 0, 2, 2, 0, 0],
  aug: [null, 0, 3, 2, 2, 1],
  dim: [null, 0, 1, 2, 1, null],
  "5": [null, 0, 2, 2, null, null],
  m7b5: [null, 0, 1, 2, 1, 2],
  "11": [null, 0, 2, 2, 3, 3],
  m11: [null, 0, 2, 2, 1, 3],
  "13": [null, 0, 2, 0, 2, 2],
  "7sus4": [null, 0, 2, 2, 3, 0],
};

const PITCH: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export function lookupGuitarVoicing(displayedName: string): GuitarVoicingLookup {
  const label = displayedName.trim();
  if (!label) return { ok: false, label };

  const parsed = parseCifraChord(label);
  if (!parsed) return { ok: false, label };

  const strings = voicingFor(parsed);
  if (!strings) return { ok: false, label };

  return { ok: true, label, strings };
}

function parseCifraChord(name: string): ParsedChord | null {
  const { main, bass } = splitBass(name);
  const match = /^([A-G])([#b])?(.*)$/.exec(main);
  if (!match) return null;

  const root = `${match[1]!}${match[2] ?? ""}`;
  const quality = qualityFromSuffix(match[3] ?? "");
  if (!quality) return null;

  return { root, quality, bass };
}

function splitBass(name: string): { main: string; bass: string | null } {
  const slash = name.lastIndexOf("/");
  if (slash <= 0) return { main: name, bass: null };

  const after = name.slice(slash + 1);
  if (NOTE.test(after)) {
    return { main: name.slice(0, slash), bass: after };
  }
  return { main: name, bass: null };
}

function qualityFromSuffix(raw: string): Quality | null {
  let suffix = raw.replace(/\s+/g, "");
  suffix = suffix.replace(/m7M/g, "mmaj7");
  suffix = suffix.replace(/7M/g, "maj7");
  suffix = suffix.replace(/7\+/g, "maj7");
  suffix = suffix.replace(/7\/9|7\\9|79/g, "9");
  suffix = suffix.replace(/m7\/5-|m7b5|ø/gi, "m7b5");
  suffix = suffix.replace(/5\+/g, "aug");
  suffix = suffix.replace(/°|º/g, "dim");
  suffix = suffix.replace(/7\/4/g, "7sus4");
  suffix = suffix.replace(/[()]/g, "");
  if (suffix === "4") suffix = "sus4";
  else if (suffix.startsWith("4") && !suffix.startsWith("11")) {
    suffix = `sus4${suffix.slice(1)}`;
  }

  return QUALITY_BY_SUFFIX[suffix] ?? null;
}

function voicingFor(parsed: ParsedChord): GuitarVoicingStrings | null {
  const exact = OPEN[canonicalKey(parsed)];
  if (exact) return decode(exact);

  if (parsed.bass) return null;

  return barreVoicing(parsed.root, parsed.quality);
}

function canonicalKey(parsed: ParsedChord): string {
  const body = `${parsed.root}${qualityToken(parsed.quality)}`;
  return parsed.bass ? `${body}/${parsed.bass}` : body;
}

function qualityToken(quality: Quality): string {
  switch (quality) {
    case "major":
      return "";
    case "minor":
      return "m";
    default:
      return quality;
  }
}

function barreVoicing(
  root: string,
  quality: Quality,
): GuitarVoicingStrings | null {
  const pitch = PITCH[root];
  if (pitch === undefined) return null;

  const sixthFret = (pitch - PITCH.E! + 12) % 12;
  const fifthFret = (pitch - PITCH.A! + 12) % 12;
  const useAShape =
    fifthFret > 0 && (sixthFret === 0 || fifthFret <= sixthFret);
  const template = useAShape ? A_SHAPE[quality] : E_SHAPE[quality];
  const fret = useAShape ? fifthFret : sixthFret === 0 ? 12 : sixthFret;
  if (!template) return null;

  return shift(template, fret);
}

function shift(
  template: GuitarVoicingStrings,
  fret: number,
): GuitarVoicingStrings {
  return template.map((value) =>
    value === null ? null : value + fret,
  ) as GuitarVoicingStrings;
}

function decode(encoded: string): GuitarVoicingStrings {
  const frets = [...encoded].map((char) => {
    if (char === "x") return null;
    if (char >= "0" && char <= "9") return Number(char);
    if (char === "a") return 10;
    if (char === "b") return 11;
    if (char === "c") return 12;
    return null;
  });
  return frets as GuitarVoicingStrings;
}
