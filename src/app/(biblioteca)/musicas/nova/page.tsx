import { SongForm } from "~/app/(biblioteca)/musicas/_components/song-form";
import { api } from "~/trpc/server";

export default async function NewSongPage() {
  const viewer = await api.auth.viewer();

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Nova música
        </h1>
        <p className="text-muted">Apenas editores podem criar músicas.</p>
      </>
    );
  }

  const artists = await api.artist.list();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Nova música</h1>
      <SongForm artists={artists} />
    </>
  );
}
