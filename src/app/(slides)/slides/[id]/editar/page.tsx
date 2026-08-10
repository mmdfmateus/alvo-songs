import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgramBuilder } from "~/app/(slides)/slides/_components/program-builder";
import {
  PROGRAM_OWNERS_COOKIE,
  parseOwnerTokens,
} from "~/lib/program-owners-cookie";
import { api } from "~/trpc/server";

export default async function ProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await api.program.byId({ id });
  if (!program) notFound();

  const ownerToken =
    parseOwnerTokens((await cookies()).get(PROGRAM_OWNERS_COOKIE)?.value)[id] ??
    null;

  if (!ownerToken) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Editar slides
        </h1>
        <p className="text-muted">
          Só o navegador que criou estes Slides pode editar. Se o cookie foi
          perdido, o link continua só para visualização.
        </p>
        <Link
          href={`/slides/${id}`}
          className="mt-4 inline-block text-sm font-semibold text-accent no-underline"
        >
          Abrir visualização pública
        </Link>
      </>
    );
  }

  const editable = await api.program.forEdit({ id, ownerToken });
  if (!editable) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Editar slides
        </h1>
        <p className="text-muted">
          Só o navegador que criou estes Slides pode editar.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Editar slides
      </h1>
      <ProgramBuilder program={editable} ownerToken={ownerToken} />
    </>
  );
}
