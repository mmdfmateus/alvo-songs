import { api } from "~/trpc/server";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await api.auth.viewer();

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Editar artista
        </h1>
        <p className="text-muted">Apenas editores podem editar artistas.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Editar artista
      </h1>
      <p className="text-muted">Em breve: editar o Artista. ({id})</p>
    </>
  );
}
