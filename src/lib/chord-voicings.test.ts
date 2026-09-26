import { expect, test } from "vitest";

import {
  cycleVoicingIndex,
  voicingsForDisplayedChord,
} from "~/lib/chord-voicings";

test("voicingsForDisplayedChord maps a plain C to a known open shape", () => {
  const voicings = voicingsForDisplayedChord("C");
  expect(voicings[0]?.frets).toEqual(["x", 3, 2, 0, 1, 0]);
  expect(voicings.length).toBeGreaterThan(1);
});

test("voicingsForDisplayedChord maps livrinho F4 and C7M spellings", () => {
  expect(voicingsForDisplayedChord("F4")[0]?.frets).toEqual([1, 3, 3, 3, 1, 1]);
  expect(voicingsForDisplayedChord("C7M")[0]?.frets).toEqual(["x", 3, 2, 0, 0, 0]);
});

test("voicingsForDisplayedChord maps a common slash without inventing a new shape", () => {
  expect(voicingsForDisplayedChord("C/G")[0]?.frets).toEqual([3, 3, 2, 0, 1, 0]);
});

test("voicingsForDisplayedChord returns no shapes for an unmapped name", () => {
  expect(voicingsForDisplayedChord("H13(b9)")).toEqual([]);
  expect(voicingsForDisplayedChord("")).toEqual([]);
});

test("cycleVoicingIndex wraps when several voicings exist", () => {
  expect(cycleVoicingIndex(3, 0)).toBe(1);
  expect(cycleVoicingIndex(3, 2)).toBe(0);
});

test("cycleVoicingIndex stays put when there are not several voicings", () => {
  expect(cycleVoicingIndex(1, 0)).toBe(0);
  expect(cycleVoicingIndex(0, 0)).toBe(0);
});
