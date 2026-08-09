import { api } from "~/trpc/server";

export default async function EditSongPage({
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
          Editar música
        </h1>
        <p className="text-muted">Apenas editores podem editar músicas.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Editar música
      </h1>
      <p className="text-muted">Em breve: editar a Cifra e os Trechos. ({id})</p>
    </>
  );
}
