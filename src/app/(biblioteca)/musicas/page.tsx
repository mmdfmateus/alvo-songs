import Link from "next/link";

import { api } from "~/trpc/server";

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const songs = query
    ? await api.song.search({ q: query })
    : await api.song.list();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Músicas</h1>
      {songs.length === 0 ? (
        <p className="text-muted">
          {query
            ? "Nenhuma música encontrada."
            : "Nenhuma música na Biblioteca ainda."}
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {songs.map((song) => (
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
