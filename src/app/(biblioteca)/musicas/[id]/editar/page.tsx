import { notFound } from "next/navigation";

import { SongForm } from "~/app/(biblioteca)/musicas/_components/song-form";
import { api } from "~/trpc/server";

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [viewer, song, artists] = await Promise.all([
    api.auth.viewer(),
    api.song.byId({ id }),
    api.artist.list(),
  ]);

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Editar música
        </h1>
        <p className="text-muted">Apenas editores podem editar músicas.</p>
      </>
    );
  }

  if (!song) notFound();

  return <SongForm artists={artists} song={song} />;
}
