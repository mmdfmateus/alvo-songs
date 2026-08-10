import Link from "next/link";

import { bibliotecaSubnav } from "~/app/_components/biblioteca-subnav";
import { SongSearch } from "~/app/_components/song-search";
import { signOut } from "~/server/auth";
import { api } from "~/trpc/server";

export async function SiteHeader({
  mode,
}: {
  mode: "biblioteca" | "slides";
}) {
  const viewer = await api.auth.viewer();
  const subnav = mode === "biblioteca" ? bibliotecaSubnav(viewer.isEditor) : [];

  return (
    <header className="sticky top-0 z-10 border-b-[3px] border-accent bg-paper px-5 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight no-underline"
        >
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-white">
            A
          </span>
          Alvo Cifras
        </Link>
        <SongSearch />
        <nav
          aria-label="Áreas"
          className="ml-auto inline-flex rounded-full bg-[#f0f0ec] p-0.5"
        >
          <Link
            href="/"
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline ${
              mode === "biblioteca"
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Biblioteca
          </Link>
          <Link
            href="/slides"
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline ${
              mode === "slides"
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Slides
          </Link>
        </nav>
        {viewer.signedIn ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="px-2 py-1 text-sm font-medium text-muted hover:text-ink"
            >
              Sair
            </button>
          </form>
        ) : (
          <Link
            href="/entrar"
            className="px-2 py-1 text-sm font-medium text-muted no-underline hover:text-ink"
          >
            Entrar
          </Link>
        )}
      </div>
      {subnav.length > 0 ? (
        <nav aria-label="Biblioteca" className="mt-2.5 flex flex-wrap gap-1">
          {subnav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2 py-1 text-sm font-medium text-muted no-underline hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
