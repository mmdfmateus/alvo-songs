import { expect, test } from "vitest";

import { bibliotecaSubnav } from "~/app/_components/biblioteca-subnav";

test("public Biblioteca subnav is Músicas and Artistas only", () => {
  expect(bibliotecaSubnav(false)).toEqual([
    { href: "/musicas", label: "Músicas" },
    { href: "/artistas", label: "Artistas" },
  ]);
});

test("editor chrome adds Nova música and Novo artista, not an Editor nav item", () => {
  const links = bibliotecaSubnav(true);
  expect(links).toEqual([
    { href: "/musicas", label: "Músicas" },
    { href: "/artistas", label: "Artistas" },
    { href: "/musicas/nova", label: "Nova música" },
    { href: "/artistas/novo", label: "Novo artista" },
    { href: "/musicas/revisar", label: "Revisar" },
  ]);
  expect(links.map((link) => link.label)).not.toContain("Editor");
});
