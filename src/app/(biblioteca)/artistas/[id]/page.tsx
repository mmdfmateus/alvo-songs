import Link from "next/link";
import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [artist, viewer] = await Promise.all([
    api.artist.byId({ id }),
    api.auth.viewer(),
  ]);

  if (!artist) notFound();

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt=""
              className="size-[72px] rounded-lg object-cover"
            />
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight">
            {artist.name}
          </h1>
        </div>
        {viewer.isEditor ? (
          <Link
            href={`/artistas/${artist.id}/editar`}
            className="text-sm font-semibold text-accent no-underline"
          >
            Editar
          </Link>
        ) : null}
      </div>
      {artist.songs.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma música deste artista ainda.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {artist.songs.map((song) => (
            <li key={song.id}>
              <Link
                href={`/musicas/${song.id}`}
                className="block px-4 py-3 no-underline hover:bg-[#fafafa]"
              >
                {song.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
