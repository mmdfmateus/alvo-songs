import { expect, test } from "vitest";

import { isProgramDraftSavable } from "~/lib/program-autosave";

test("empty Program name is not savable", () => {
  expect(
    isProgramDraftSavable({
      name: "   ",
      sections: [],
    }),
  ).toBe(false);
});

test("Abertura without a community name is not savable", () => {
  expect(
    isProgramDraftSavable({
      name: "Culto 09/08",
      sections: [
        { type: "opening", payload: { communityName: "" } },
      ],
    }),
  ).toBe(false);
});

test("Recados without a title is not savable", () => {
  expect(
    isProgramDraftSavable({
      name: "Culto 09/08",
      sections: [
        { type: "announcements", payload: { title: "  " } },
      ],
    }),
  ).toBe(false);
});

test("Música with no library Song is still savable", () => {
  expect(
    isProgramDraftSavable({
      name: "Culto 09/08",
      sections: [{ type: "song", songId: null, payload: {} }],
    }),
  ).toBe(true);
});

test("a named Program with valid sections is savable", () => {
  expect(
    isProgramDraftSavable({
      name: "Culto 09/08",
      sections: [
        {
          type: "opening",
          payload: { communityName: "COMU JOVEM", subtitle: "Culto 09/08" },
        },
        { type: "song", songId: "abc", payload: {} },
        { type: "announcements", payload: { title: "Avisos" } },
      ],
    }),
  ).toBe(true);
});
