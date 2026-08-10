import { expect, test } from "vitest";

import { expandSections } from "~/lib/slides";

test("Abertura expands to a brand opening slide", () => {
  expect(
    expandSections([
      {
        type: "opening",
        payload: { communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
      },
    ]),
  ).toEqual([
    {
      kind: "opening",
      communityName: "COMU JOVEM",
      subtitle: "Culto 09/08",
    },
  ]);
});

test("Recados and Brincadeira expand to title-chip plus exactly 1 blank", () => {
  expect(
    expandSections([
      { type: "announcements", payload: { title: "Avisos" } },
      { type: "game", payload: { title: "Dinâmica" } },
    ]),
  ).toEqual([
    { kind: "titleChip", title: "Avisos" },
    { kind: "blank" },
    { kind: "titleChip", title: "Dinâmica" },
    { kind: "blank" },
  ]);
});

test("Brincadeira has no extra label slide", () => {
  const slides = expandSections([{ type: "game", payload: { title: "Quebra-gelo" } }]);
  expect(slides.filter((slide) => slide.kind === "titleChip")).toHaveLength(1);
  expect(slides.some((slide) => slide.kind === "lyric")).toBe(false);
});

test("Momento expands to a title-chip only", () => {
  expect(expandSections([{ type: "moment", payload: { title: "Oração" } }])).toEqual([
    { kind: "titleChip", title: "Oração" },
  ]);
});
