export default async function ProgramViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Slides</h1>
      <p className="text-muted">Programa ainda sem seções. ({id})</p>
    </>
  );
}
