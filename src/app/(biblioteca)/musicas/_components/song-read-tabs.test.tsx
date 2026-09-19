/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { SongReadTabs } from "~/app/(biblioteca)/musicas/_components/song-read-tabs";
import type { CifraViewLine } from "~/lib/cifra";

afterEach(cleanup);

const lines: CifraViewLine[] = [
  { parts: [{ chords: "Am", lyrics: "Let it be" }] },
];

test("tapping a Cifra chord opens a fretboard dialog", async () => {
  const user = userEvent.setup();
  render(<SongReadTabs cifraLines={lines} letra="Let it be" />);

  await user.click(screen.getByRole("button", { name: "Am" }));

  const dialog = await screen.findByRole("dialog");
  expect(dialog.textContent).toContain("Am");
  expect(screen.getByRole("img", { name: "Diagrama de Am" })).toBeTruthy();
});

test("unmapped Cifra names open an explicit miss state", async () => {
  const user = userEvent.setup();
  render(
    <SongReadTabs
      cifraLines={[{ parts: [{ chords: "Nxyz", lyrics: "oi" }] }]}
      letra="oi"
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
    <SongReadTabs cifraLines={lines} letra="Let it be" videoId="abc123" />,
  );

  await user.click(screen.getByRole("tab", { name: "Letra" }));
  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();

  await user.click(screen.getByRole("tab", { name: "Escutar" }));
  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();
  expect(screen.queryByRole("img", { name: /Diagrama/ })).toBeNull();
});

test("editor Cifra preview does not open diagrams", () => {
  render(<CifraView lines={lines} />);

  expect(screen.queryByRole("button", { name: "Am" })).toBeNull();
  expect(screen.getByText("Am")).toBeTruthy();
});
