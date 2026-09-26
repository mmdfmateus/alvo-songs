/** @vitest-environment jsdom */

import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test } from "vitest";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { SongReadTabs } from "~/app/(biblioteca)/musicas/_components/song-read-tabs";
import { parseCifra } from "~/lib/cifra-parse";

afterEach(cleanup);

const LET_IT_BE = `       Am         C/G        F          C
Let it be, let it be, let it be, let it be`;

const storedLetra = "Let it be, let it be, let it be, let it be";

test("Cifra tab hides Tom controls behind a top-right icon", () => {
  const html = renderToStaticMarkup(
    createElement(SongReadTabs, {
      cifra: parseCifra(LET_IT_BE),
      letra: storedLetra,
    }),
  );

  expect(html).toContain('aria-label="Tom"');
  expect(html).toContain("Diminuir tom");
  expect(html).toContain("Aumentar tom");
  expect(html).toContain("Restaurar tom original");
  expect(html).toContain("Am");
  expect(html).not.toContain("Bm");
});

test("Letra is the stored reading, not shown as the Cifra Tom toolbar target", () => {
  const html = renderToStaticMarkup(
    createElement(SongReadTabs, {
      cifra: parseCifra(LET_IT_BE),
      letra: storedLetra,
      videoId: "abc123",
    }),
  );

  expect(html).toContain("Escutar");
  expect(html).not.toContain("youtube-nocookie");
  expect(html).toContain('aria-label="Tom"');
});

test("tapping a Cifra chord opens a fretboard dialog", async () => {
  const user = userEvent.setup();
  render(
    <SongReadTabs cifra={parseCifra("Am\nLet it be")} letra="Let it be" />,
  );

  await user.click(screen.getByRole("button", { name: "Am" }));

  const dialog = await screen.findByRole("dialog");
  expect(dialog.textContent).toContain("Am");
  expect(screen.getByRole("img", { name: "Diagrama de Am" })).toBeTruthy();
});

test("unmapped Cifra names open an explicit miss state", async () => {
  const user = userEvent.setup();
  render(
    <CifraView
      interactiveChords
      lines={[{ parts: [{ chords: "Nxyz", lyrics: "oi" }] }]}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Nxyz" }));

  const dialog = await screen.findByRole("dialog");
  expect(dialog.textContent).toContain("Nxyz");
  expect(dialog.textContent).toContain("Não há diagrama para este acorde.");
  expect(screen.queryByRole("img")).toBeNull();
});

test("Letra and Escutar do not show chord diagrams", async () => {
  const user = userEvent.setup();
  render(
    <SongReadTabs
      cifra={parseCifra("Am\nLet it be")}
      letra="Let it be"
      videoId="abc123"
    />,
  );

  await user.click(screen.getByRole("tab", { name: "Letra" }));
  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();

  await user.click(screen.getByRole("tab", { name: "Escutar" }));
  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();
  expect(screen.queryByRole("img", { name: /Diagrama/ })).toBeNull();
});

test("editor Cifra preview does not open diagrams", () => {
  render(
    <CifraView lines={[{ parts: [{ chords: "Am", lyrics: "Let it be" }] }]} />,
  );

  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();
  expect(screen.getByText("Am")).toBeTruthy();
});
