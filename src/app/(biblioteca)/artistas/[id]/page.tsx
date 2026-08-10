export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Artista</h1>
      <p className="text-muted">Este artista ainda não está na Biblioteca. ({id})</p>
    </>
  );
}
