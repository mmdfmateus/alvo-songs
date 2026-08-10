import { ArtistForm } from "~/app/(biblioteca)/artistas/_components/artist-form";
import { api } from "~/trpc/server";

export default async function NewArtistPage() {
  const viewer = await api.auth.viewer();

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Novo artista
        </h1>
        <p className="text-muted">Apenas editores podem criar artistas.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Novo artista
      </h1>
      <ArtistForm />
    </>
  );
}
