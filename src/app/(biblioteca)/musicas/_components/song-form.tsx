"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { cifraToCow, parseCifra } from "~/lib/cifra-parse";
import { cifraViewLines } from "~/lib/cifra";
import { api } from "~/trpc/react";

type ArtistOption = { id: string; name: string };

type SongFormProps = {
  artists: ArtistOption[];
  song?: {
    id: string;
    title: string;
    artist: { id: string } | null;
    cifra: unknown;
    cifraText?: string;
    videoId?: string | null;
  };
};

function parseYoutubeVideoId(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      return url.pathname.replace(/^\//, "").split("/")[0] ?? trimmed;
    }
    const v = url.searchParams.get("v");
    if (v) return v;
    const embed = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embed?.[1]) return embed[1];
  } catch {
    // raw id
  }
  return trimmed;
}

export function SongForm({ artists, song }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artistId, setArtistId] = useState(song?.artist?.id ?? "");
  const [videoId, setVideoId] = useState(song?.videoId ?? "");
  const [cifraText, setCifraText] = useState(
    song?.cifraText ?? (song ? cifraToCow(song.cifra) : ""),
  );

  const preview = useMemo(() => {
    try {
      const cifra = parseCifra(cifraText);
      return {
        ok: true as const,
        lines: cifraViewLines(cifra),
      };
    } catch {
      return { ok: false as const };
    }
  }, [cifraText]);

  const create = api.song.create.useMutation({
    onSuccess: (created) => router.push(`/musicas/${created.id}`),
  });
  const update = api.song.update.useMutation({
    onSuccess: (updated) => router.push(`/musicas/${updated.id}`),
  });
  const remove = api.song.delete.useMutation({
    onSuccess: () => router.push("/musicas"),
  });

  const pending = create.isPending || update.isPending || remove.isPending;
  const error =
    create.error?.message ?? update.error?.message ?? remove.error?.message;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = {
          title,
          cifraText,
          artistId: artistId || undefined,
          videoId: parseYoutubeVideoId(videoId) || undefined,
        };
        if (song) {
          update.mutate({ id: song.id, ...payload });
        } else {
          create.mutate(payload);
        }
      }}
    >
      <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
        Título
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
      </label>
      {artists.length > 0 ? (
        <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
          Artista (opcional)
          <select
            value={artistId}
            onChange={(event) => setArtistId(event.target.value)}
            className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
          >
            <option value="">Sem artista</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
        YouTube (opcional)
        <input
          value={videoId}
          onChange={(event) => setVideoId(event.target.value)}
          placeholder="ID do vídeo ou URL"
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
        <span className="font-normal text-muted">
          Cole o id do vídeo (ex.: dQw4w9WgXcQ) ou a URL completa.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Cifra
        <textarea
          required
          value={cifraText}
          onChange={(event) => setCifraText(event.target.value)}
          rows={12}
          spellCheck={false}
          placeholder={"Am          C\nLetra na linha de baixo"}
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 font-mono text-sm font-normal leading-relaxed"
        />
      </label>
      <section className="rounded-[10px] border border-line bg-paper p-4">
        <h2 className="mb-2 text-sm font-semibold">Prévia</h2>
        {preview.ok ? (
          <CifraView lines={preview.lines} />
        ) : (
          <p className="text-sm text-accent">
            Não foi possível ler a Cifra. Cole no formato acordes acima da
            letra.
          </p>
        )}
      </section>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending || !preview.ok}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {song ? "Salvar" : "Criar música"}
        </button>
        {song ? (
          <button
            type="button"
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
            onClick={() => {
              if (window.confirm("Excluir esta Música da Biblioteca?")) {
                remove.mutate({ id: song.id });
              }
            }}
          >
            Excluir
          </button>
        ) : null}
      </div>
    </form>
  );
}
