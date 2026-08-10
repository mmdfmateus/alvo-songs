import Link from "next/link";

import { LivrinhoFlags } from "~/app/(biblioteca)/musicas/_components/livrinho-flags";
import { loadImportedLivrinho } from "~/lib/livrinho-import";
import { api } from "~/trpc/server";

export default async function LivrinhoReviewPage() {
  const viewer = await api.auth.viewer();

  if (!viewer.isEditor) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Revisar importação
        </h1>
        <p className="text-muted">Apenas editores revisam o livrinho.</p>
      </>
    );
  }

  const [library, imported] = await Promise.all([
    api.song.list(),
    Promise.resolve(loadImportedLivrinho()),
  ]);
  const idByTitle = new Map(library.map((song) => [song.title, song.id]));
  const flagged = imported.filter((song) => song.flags.length > 0);

  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Revisar importação
      </h1>
      <p className="mb-4 text-sm text-muted">
        Cifra e Trechos do livrinho que o seed sinalizou. Artist fica vazio até
        um editor creditar.
      </p>
      {flagged.length === 0 ? (
        <p className="text-muted">Nenhuma música sinalizada.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[10px] border border-line bg-paper">
          {flagged.map((song) => {
            const id = idByTitle.get(song.title);
            return (
              <li key={song.title} className="px-4 py-3">
                {id ? (
                  <Link
                    href={`/musicas/${id}`}
                    className="font-medium no-underline hover:text-accent"
                  >
                    {song.title}
                  </Link>
                ) : (
                  <span className="font-medium">{song.title}</span>
                )}
                {!id ? (
                  <p className="mt-0.5 text-sm text-muted">
                    Ainda não está na Biblioteca. Rode <code>pnpm db:seed</code>.
                  </p>
                ) : null}
                <LivrinhoFlags flags={song.flags} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
