export type NavLink = {
  href: string;
  label: string;
};

export const bibliotecaBrowseLinks: NavLink[] = [
  { href: "/musicas", label: "Músicas" },
  { href: "/artistas", label: "Artistas" },
];

export const bibliotecaCreateLinks: NavLink[] = [
  { href: "/musicas/nova", label: "Nova música" },
  { href: "/artistas/novo", label: "Novo artista" },
];

export const bibliotecaReviewLink: NavLink = {
  href: "/musicas/revisar",
  label: "Revisar",
};

export const bibliotecaEditorLinks: NavLink[] = [
  ...bibliotecaCreateLinks,
  bibliotecaReviewLink,
];

export function bibliotecaSubnav(isEditor: boolean): NavLink[] {
  return isEditor
    ? [...bibliotecaBrowseLinks, ...bibliotecaEditorLinks]
    : [...bibliotecaBrowseLinks];
}

export function isNavActive(
  pathname: string,
  href: string,
  siblings: string[],
): boolean {
  const matches = (path: string, target: string) =>
    path === target || path.startsWith(`${target}/`);

  if (!matches(pathname, href)) {
    return false;
  }

  return !siblings.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      matches(pathname, other),
  );
}
