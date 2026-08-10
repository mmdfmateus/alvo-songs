export type NavLink = {
  href: string;
  label: string;
};

export function bibliotecaSubnav(isEditor: boolean): NavLink[] {
  const links: NavLink[] = [
    { href: "/musicas", label: "Músicas" },
    { href: "/artistas", label: "Artistas" },
  ];

  if (isEditor) {
    links.push({ href: "/musicas/nova", label: "Nova música" });
    links.push({ href: "/artistas/novo", label: "Novo artista" });
    links.push({ href: "/musicas/revisar", label: "Revisar" });
  }

  return links;
}
