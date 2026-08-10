import { notFound } from "next/navigation";

import { SlidePreview } from "~/app/(slides)/slides/_components/slide-preview";
import { api } from "~/trpc/server";

export default async function ProgramViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await api.program.byId({ id });
  if (!program) notFound();

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">{program.name}</h1>
      <p className="mb-6 text-sm text-muted">Visualização pública. Só quem criou pode editar.</p>
      <SlidePreview slides={program.slides} />
    </>
  );
}
