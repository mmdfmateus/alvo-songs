import Link from "next/link";

import { api } from "~/trpc/server";

export default async function HomePage() {
  const [songs, artists] = await Promise.all([
    api.song.list(),
    api.artist.list(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="flex min-h-56 flex-col rounded-[10px] border border-line bg-paper p-4">
        <h1 className="text-xl font-semibold">Músicas</h1>
        <p className="mt-1 text-sm text-muted">
          {songs.length === 0
            ? "A Biblioteca ainda está vazia."
            : `${songs.length} músicas.`}
        </p>
        <div className="mt-auto border-t border-line pt-3">
          <Link
            href="/musicas"
            className="text-sm font-semibold text-accent no-underline"
          >
            Ver todas
          </Link>
        </div>
      </section>
      <section className="flex min-h-56 flex-col rounded-[10px] border border-line bg-paper p-4">
        <h2 className="text-xl font-semibold">Artistas</h2>
        <p className="mt-1 text-sm text-muted">
          {artists.length === 0
            ? "Nenhum artista ainda."
            : `${artists.length} artistas.`}
        </p>
        <div className="mt-auto border-t border-line pt-3">
          <Link
            href="/artistas"
            className="text-sm font-semibold text-accent no-underline"
          >
            Ver todos
          </Link>
        </div>
      </section>
    </div>
  );
}
