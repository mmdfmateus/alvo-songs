import { expect, test } from "vitest";

import {
  bibliotecaSubnav,
  isNavActive,
} from "~/app/_components/biblioteca-subnav";

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

const editorHrefs = bibliotecaSubnav(true).map((link) => link.href);

test("browse Músicas is active on the list and a song page, not on Nova or Revisar", () => {
  expect(isNavActive("/musicas", "/musicas", editorHrefs)).toBe(true);
  expect(isNavActive("/musicas/abc/editar", "/musicas", editorHrefs)).toBe(
    true,
  );
  expect(isNavActive("/musicas/nova", "/musicas", editorHrefs)).toBe(false);
  expect(isNavActive("/musicas/revisar", "/musicas", editorHrefs)).toBe(false);
});

test("editor action links win over the browse prefix", () => {
  expect(isNavActive("/musicas/nova", "/musicas/nova", editorHrefs)).toBe(true);
  expect(isNavActive("/artistas/novo", "/artistas", editorHrefs)).toBe(false);
  expect(isNavActive("/artistas/novo", "/artistas/novo", editorHrefs)).toBe(
    true,
  );
});
