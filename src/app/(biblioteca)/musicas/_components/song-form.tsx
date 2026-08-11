"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { cifraToCow, parseCifra } from "~/lib/cifra-parse";
import { cifraViewLines } from "~/lib/cifra";
import { api } from "~/trpc/react";

type ArtistOption = { id: string; name: string };

type ChunkDraft = { key: string; text: string };

type SongFormProps = {
  artists: ArtistOption[];
  song?: {
    id: string;
    title: string;
    artist: { id: string } | null;
    cifra: unknown;
    cifraText?: string;
    chunks?: { id: string; text: string }[];
  };
};

function newChunkKey() {
  return crypto.randomUUID();
}

export function SongForm({ artists, song }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artistId, setArtistId] = useState(song?.artist?.id ?? "");
  const [cifraText, setCifraText] = useState(
    song?.cifraText ?? (song ? cifraToCow(song.cifra) : ""),
  );
  const [chunks, setChunks] = useState<ChunkDraft[]>(
    song?.chunks?.map((chunk) => ({ key: chunk.id, text: chunk.text })) ?? [],
  );
  const [tab, setTab] = useState<"cifra" | "trechos">("cifra");

  function moveChunk(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= chunks.length) return;
    const copy = [...chunks];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    setChunks(copy);
  }

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
        };
        if (song) {
          update.mutate({
            id: song.id,
            ...payload,
            chunks: chunks.map(({ text }) => ({ text })),
          });
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
      {song ? (
        <div
          role="tablist"
          aria-label="Edição da música"
          className="inline-flex rounded-full bg-[#f0f0ec] p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "cifra"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              tab === "cifra" ? "bg-ink text-white" : "text-muted"
            }`}
            onClick={() => setTab("cifra")}
          >
            Cifra
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "trechos"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              tab === "trechos" ? "bg-ink text-white" : "text-muted"
            }`}
            onClick={() => setTab("trechos")}
          >
            Trechos
          </button>
        </div>
      ) : null}
      {!song || tab === "cifra" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Cifra
            <textarea
              required
              value={cifraText}
              onChange={(event) => setCifraText(event.target.value)}
              rows={16}
              spellCheck={false}
              placeholder={"Am          C\nLetra na linha de baixo"}
              className="min-h-[20rem] flex-1 rounded-lg border border-line bg-[#fafafa] px-3 py-2 font-mono text-sm font-normal leading-relaxed"
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
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chunks.map((chunk, index) => (
            <div
              key={chunk.key}
              className="flex flex-col gap-2 rounded-[10px] border border-line bg-paper p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Trecho</p>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => moveChunk(index, -1)}
                    disabled={index === 0}
                    className="text-muted hover:text-ink disabled:opacity-40"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => moveChunk(index, 1)}
                    disabled={index === chunks.length - 1}
                    className="text-muted hover:text-ink disabled:opacity-40"
                  >
                    Descer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChunks(chunks.filter((_, i) => i !== index))
                    }
                    className="font-semibold text-accent"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <textarea
                value={chunk.text}
                onChange={(event) => {
                  const copy = [...chunks];
                  const current = copy[index];
                  if (!current) return;
                  copy[index] = { ...current, text: event.target.value };
                  setChunks(copy);
                }}
                rows={4}
                className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal leading-relaxed"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setChunks([...chunks, { key: newChunkKey(), text: "" }])
            }
            className="self-start rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
          >
            Adicionar trecho
          </button>
        </div>
      )}
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
