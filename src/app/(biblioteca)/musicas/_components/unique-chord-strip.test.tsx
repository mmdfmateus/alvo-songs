import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { UniqueChordStrip } from "~/app/(biblioteca)/musicas/_components/unique-chord-strip";

test("unique-chord strip stays closed until Acordes is opened", () => {
  const html = renderToStaticMarkup(
    createElement(UniqueChordStrip, { names: ["Em", "Am"] }),
  );

  expect(html).toContain("<details");
  expect(html).not.toMatch(/<details[^>]*\sopen/);
  expect(html).toContain("Acordes");
  expect(html).toContain("Em");
  expect(html).toContain("Am");
});
