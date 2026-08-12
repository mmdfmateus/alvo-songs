import { notFound } from "next/navigation";

import { ArtistForm } from "~/app/(biblioteca)/artistas/_components/artist-form";
import { api } from "~/trpc/server";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [viewer, artist] = await Promise.all([
    api.auth.viewer(),
    api.artist.byId({ id }),
  ]);

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Editar artista
        </h1>
        <p className="text-muted-foreground">Apenas editores podem editar artistas.</p>
      </>
    );
  }

  if (!artist) notFound();

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Editar artista
      </h1>
      <ArtistForm artist={artist} />
    </>
  );
}
