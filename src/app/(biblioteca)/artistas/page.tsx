import Link from "next/link";

import { api } from "~/trpc/server";

export default async function ArtistsPage() {
  const artists = await api.artist.list();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Artistas</h1>
      {artists.length === 0 ? (
        <p className="text-muted">Nenhum artista ainda.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {artists.map((artist) => (
            <li key={artist.id}>
              <Link
                href={`/artistas/${artist.id}`}
                className="block px-4 py-3 no-underline hover:bg-[#fafafa]"
              >
                {artist.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
