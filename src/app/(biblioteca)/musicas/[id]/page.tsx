export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Música</h1>
      <p className="text-muted">
        Esta música ainda não está na Biblioteca. ({id})
      </p>
    </>
  );
}
