import Link from "next/link";
import { notFound } from "next/navigation";

import { LivrinhoFlags } from "~/app/(biblioteca)/musicas/_components/livrinho-flags";
import { SongReadTabs } from "~/app/(biblioteca)/musicas/_components/song-read-tabs";
import { cifraViewLines } from "~/lib/cifra";
import { livrinhoFlagsByTitle, loadImportedLivrinho } from "~/lib/livrinho-import";
import { api } from "~/trpc/server";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [song, viewer] = await Promise.all([
    api.song.byId({ id }),
    api.auth.viewer(),
  ]);

  if (!song) notFound();

  const flags = viewer.isEditor
    ? (livrinhoFlagsByTitle(loadImportedLivrinho()).get(song.title) ?? [])
    : [];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            {song.artist?.imageUrl ? (
              <img
                src={song.artist.imageUrl}
                alt=""
                className="size-[48px] rounded-lg object-cover"
              />
            ) : null}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {song.title}
              </h1>
              {song.artist ? (
                <Link
                  href={`/artistas/${song.artist.id}`}
                  className="mt-1 inline-block text-sm font-medium text-muted-foreground no-underline hover:text-ink"
                >
                  {song.artist.name}
                </Link>
              ) : null}
              {viewer.isEditor && flags.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Sinalizada na importação do livrinho.
                  </p>
                  <LivrinhoFlags flags={flags} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {viewer.isEditor ? (
          <Link
            href={`/musicas/${song.id}/editar`}
            className="text-sm font-semibold text-accent no-underline"
          >
            Editar
          </Link>
        ) : null}
      </div>
      <SongReadTabs
        cifraLines={cifraViewLines(song.cifra)}
        letra={song.letra}
        videoId={song.videoId}
      />
    </>
  );
}
