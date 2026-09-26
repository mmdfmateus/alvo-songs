import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgramBuilder } from "~/app/(slides)/slides/_components/program-builder";
import {
  PrototypeLab,
  PrototypeSwitcher,
} from "~/app/(slides)/slides/_components/prototype-trechos-layout";
import { parsePrototypeVariant } from "~/app/(slides)/slides/_components/prototype-trechos-variant";
import {
  PROGRAM_OWNERS_COOKIE,
  parseOwnerTokens,
} from "~/lib/program-owners-cookie";
import { api } from "~/trpc/server";

export default async function ProgramEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { id } = await params;
  const { variant: variantParam } = await searchParams;
  const prototypeVariant =
    process.env.NODE_ENV === "production"
      ? null
      : parsePrototypeVariant(variantParam);
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
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground">
          Só o navegador que criou estes Slides pode editar.
        </p>
      </>
    );
  }

  if (!prototypeVariant) {
    return <ProgramBuilder program={editable} ownerToken={ownerToken} />;
  }

  return (
    <PrototypeLab>
      <ProgramBuilder
        program={editable}
        ownerToken={ownerToken}
        prototypeVariant={prototypeVariant}
      />
      <PrototypeSwitcher programId={id} variant={prototypeVariant} />
    </PrototypeLab>
  );
}
