export default async function ProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Editar slides
      </h1>
      <p className="text-muted">Em breve: montar as seções deste Programa. ({id})</p>
    </>
  );
}
