import { voicingsForDisplayedChord, type FretMark } from "~/lib/chord-voicings";

export type GuitarStringFret = number | null;

export type GuitarVoicingHit = {
  ok: true;
  label: string;
  /** Low E → high e, standard tuning. `null` is muted; `0` is open. */
  strings: [
    GuitarStringFret,
    GuitarStringFret,
    GuitarStringFret,
    GuitarStringFret,
    GuitarStringFret,
    GuitarStringFret,
  ];
};

export type GuitarVoicingMiss = {
  ok: false;
  label: string;
};

export type GuitarVoicingLookup = GuitarVoicingHit | GuitarVoicingMiss;

function fretMarkToString(mark: FretMark): GuitarStringFret {
  return mark === "x" ? null : mark;
}

export function lookupGuitarVoicing(displayedName: string): GuitarVoicingLookup {
  const label = displayedName.trim();
  const voicing = voicingsForDisplayedChord(label)[0];
  if (!voicing) return { ok: false, label };
  const [e, a, d, g, b, highE] = voicing.frets;
  return {
    ok: true,
    label,
    strings: [
      fretMarkToString(e),
      fretMarkToString(a),
      fretMarkToString(d),
      fretMarkToString(g),
      fretMarkToString(b),
      fretMarkToString(highE),
    ],
  };
}
