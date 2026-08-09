import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="flex min-h-56 flex-col rounded-[10px] border border-line bg-paper p-4">
        <h1 className="text-xl font-semibold">Músicas</h1>
        <p className="mt-1 text-sm text-muted">A Biblioteca ainda está vazia.</p>
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
        <p className="mt-1 text-sm text-muted">Nenhum artista ainda.</p>
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
  );
}
