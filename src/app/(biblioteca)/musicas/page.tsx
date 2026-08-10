import Link from "next/link";

import { LivrinhoFlags } from "~/app/(biblioteca)/musicas/_components/livrinho-flags";
import { livrinhoFlagsByTitle, loadImportedLivrinho } from "~/lib/livrinho-import";
import { api } from "~/trpc/server";

export default async function SongsPage() {
  const [songs, viewer] = await Promise.all([
    api.song.list(),
    api.auth.viewer(),
  ]);
  const flagsByTitle = viewer.isEditor
    ? livrinhoFlagsByTitle(loadImportedLivrinho())
    : new Map();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Músicas</h1>
      {songs.length === 0 ? (
        <p className="text-muted">Nenhuma música na Biblioteca ainda.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {songs.map((song) => {
            const flags = flagsByTitle.get(song.title) ?? [];
            return (
              <li key={song.id}>
                <Link
                  href={`/musicas/${song.id}`}
                  className="block px-4 py-3 no-underline hover:bg-[#fafafa]"
                >
                  <span className="font-medium">{song.title}</span>
                  {song.artist ? (
                    <span className="mt-0.5 block text-sm text-muted">
                      {song.artist.name}
                    </span>
                  ) : null}
                  {viewer.isEditor ? <LivrinhoFlags flags={flags} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
