import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { UniqueChordStrip } from "~/app/(biblioteca)/musicas/_components/unique-chord-strip";

test("unique-chord strip lists first-seen names", () => {
  const html = renderToStaticMarkup(
    createElement(UniqueChordStrip, { names: ["Em", "Am"] }),
  );

  expect(html).toContain("Em");
  expect(html).toContain("Am");
});
