import { expect, test } from "vitest";

import { expandSections, resolveLivePreviewSong } from "~/lib/slides";

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

test("Música expands to a title-chip plus one lyric slide per Trecho", () => {
  expect(
    expandSections([
      {
        type: "song",
        payload: {},
        song: {
          title: "Grande É o Senhor",
          chunks: [
            { text: "Grande é o Senhor e mui digno de louvor" },
            { text: "Na cidade do nosso Deus" },
          ],
        },
      },
    ]),
  ).toEqual([
    { kind: "titleChip", title: "Grande É o Senhor" },
    { kind: "lyric", text: "Grande é o Senhor e mui digno de louvor" },
    { kind: "lyric", text: "Na cidade do nosso Deus" },
  ]);
});

test("missing or null Música contributes no slides", () => {
  expect(
    expandSections([
      { type: "moment", payload: { title: "Oração" } },
      { type: "song", payload: {}, song: null },
      { type: "song", payload: {} },
      { type: "announcements", payload: { title: "Avisos" } },
    ]),
  ).toEqual([
    { kind: "titleChip", title: "Oração" },
    { kind: "titleChip", title: "Avisos" },
    { kind: "blank" },
  ]);
});

test("Música with zero Trechos expands to a title-chip only", () => {
  expect(
    expandSections([
      {
        type: "song",
        payload: {},
        song: { title: "Instrumental", chunks: [] },
      },
    ]),
  ).toEqual([{ kind: "titleChip", title: "Instrumental" }]);
});

test("live preview uses library title while Song detail is loading", () => {
  expect(
    resolveLivePreviewSong("abc", { isFetched: false }, "Let It Be"),
  ).toEqual({ title: "Let It Be", chunks: [] });
});

test("live preview treats fetched-null as a missing Song", () => {
  expect(
    resolveLivePreviewSong("abc", { isFetched: true, data: null }, "Let It Be"),
  ).toBeNull();
});

test("empty Trecho text still emits a lyric slide", () => {
  expect(
    expandSections([
      {
        type: "song",
        payload: {},
        song: {
          title: "Abre os Céus",
          chunks: [{ text: "" }, { text: "Na terra como no céu" }],
        },
      },
    ]),
  ).toEqual([
    { kind: "titleChip", title: "Abre os Céus" },
    { kind: "lyric", text: "" },
    { kind: "lyric", text: "Na terra como no céu" },
  ]);
});
