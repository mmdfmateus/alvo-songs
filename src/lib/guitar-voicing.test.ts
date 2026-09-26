import { expect, test } from "vitest";

import { lookupGuitarVoicing } from "~/lib/guitar-voicing";

test("F4 maps to a standard-tuning Fsus4 voicing", () => {
  expect(lookupGuitarVoicing("F4")).toEqual({
    ok: true,
    label: "F4",
    strings: [1, 3, 3, 3, 1, 1],
  });
});

test("7M maps to a major-seventh voicing", () => {
  expect(lookupGuitarVoicing("C7M")).toEqual({
    ok: true,
    label: "C7M",
    strings: [null, 3, 2, 0, 0, 0],
  });
});

test("slash bass maps to a standard inversion", () => {
  expect(lookupGuitarVoicing("C/G")).toEqual({
    ok: true,
    label: "C/G",
    strings: [3, 3, 2, 0, 1, 0],
  });
});

test("unknown names miss without invented frets", () => {
  expect(lookupGuitarVoicing("Nxyz")).toEqual({ ok: false, label: "Nxyz" });
  expect(lookupGuitarVoicing("Nxyz")).not.toHaveProperty("strings");
});

test("lookup uses the displayed name after session Tom", () => {
  const stored = lookupGuitarVoicing("F");
  const onScreen = lookupGuitarVoicing("G");

  expect(stored).toEqual({
    ok: true,
    label: "F",
    strings: [1, 3, 3, 2, 1, 1],
  });
  expect(onScreen).toEqual({
    ok: true,
    label: "G",
    strings: [3, 2, 0, 0, 0, 3],
  });
  expect(onScreen).not.toEqual(stored);
});
