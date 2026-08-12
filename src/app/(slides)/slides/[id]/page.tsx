import { notFound } from "next/navigation";

import { ExportPdfButton } from "~/app/(slides)/slides/_components/export-pdf-button";
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

  const brokenRefs = program.sections.filter(
    (section) =>
      section.type === "song" && section.songId && section.song === null,
  );

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">{program.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">Visualização pública. Só quem criou pode editar.</p>
      <ExportPdfButton slides={program.slides} programName={program.name} />
      {brokenRefs.length > 0 ? (
        <p className="mb-4 text-sm text-accent">
          Música não encontrada na Biblioteca
        </p>
      ) : null}
      <SlidePreview slides={program.slides} />
    </>
  );
}
