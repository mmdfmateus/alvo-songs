import Link from "next/link";

import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import type { PrototypeSurface } from "~/app/prototype/slides-access/_components/mock-chrome";

export function MockBibliotecaHome({ showSlidesCta = false }: { showSlidesCta?: boolean }) {
  return (
    <div className="mx-auto max-w-[920px] px-5 py-6">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex min-h-56 flex-col rounded-[10px] border border-line bg-paper p-4">
          <h1 className="text-xl font-semibold">Músicas</h1>
          <p className="mt-1 text-sm text-muted-foreground">142 músicas.</p>
          <div className="mt-auto border-t border-line pt-3">
            <Link
              href="/musicas"
              className="text-sm font-semibold text-accent no-underline"
            >
              Ver todas
            </Link>
          </div>
        </section>
        <section className="flex min-h-56 flex-col rounded-[10px] border border-line bg-paper p-4">
          <h2 className="text-xl font-semibold">Artistas</h2>
          <p className="mt-1 text-sm text-muted-foreground">38 artistas.</p>
          <div className="mt-auto border-t border-line pt-3">
            <Link
              href="/artistas"
              className="text-sm font-semibold text-accent no-underline"
            >
              Ver todos
            </Link>
          </div>
        </section>
      </div>

      {showSlidesCta ? (
        <section className="mt-4 rounded-[10px] border border-dashed border-line bg-paper p-4">
          <p className="text-sm font-medium">Montar slides para o culto</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use músicas da Biblioteca num programa de projeção. Não precisa de
            conta.
          </p>
          <Link
            href="/slides"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-3 inline-flex no-underline",
            )}
          >
            Abrir Slides
          </Link>
        </section>
      ) : null}
    </div>
  );
}

export function MockSlidesHome() {
  return (
    <div className="mx-auto max-w-[920px] px-5 py-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Meus slides</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Neste dispositivo. Só quem criou pode editar.
      </p>
      <Button>Novo slide</Button>
      <ul className="mt-6 divide-y divide-line rounded-[10px] border border-line bg-paper">
        {["Culto 12/08", "Ensaio COMU"].map((name) => (
          <li key={name} className="px-4 py-3 text-sm font-medium">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MockPageBody({
  surface,
  showSlidesCta = false,
}: {
  surface: PrototypeSurface;
  showSlidesCta?: boolean;
}) {
  return surface === "slides" ? (
    <MockSlidesHome />
  ) : (
    <MockBibliotecaHome showSlidesCta={showSlidesCta} />
  );
}
