"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { cifraToCow, parseCifra } from "~/lib/cifra-parse";
import { cifraViewLines } from "~/lib/cifra";
import {
  createSongAutosave,
  type SongAutosaveStatus,
} from "~/lib/song-autosave";
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
    videoId?: string | null;
    chunks?: { id: string; text: string }[];
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

function newChunkKey() {
  return crypto.randomUUID();
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconGrip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}

export function SongForm({ artists, song }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artistId, setArtistId] = useState(song?.artist?.id ?? "");
  const [videoId, setVideoId] = useState(song?.videoId ?? "");
  const [cifraText, setCifraText] = useState(
    song?.cifraText ?? (song ? cifraToCow(song.cifra) : ""),
  );
  const [chunks, setChunks] = useState<ChunkDraft[]>(
    song?.chunks?.map((chunk) => ({ key: chunk.id, text: chunk.text })) ?? [],
  );
  const [tab, setTab] = useState<"cifra" | "trechos">("cifra");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [autosaveStatus, setAutosaveStatus] =
    useState<SongAutosaveStatus>("idle");
  const autosaveRef = useRef<ReturnType<typeof createSongAutosave> | null>(
    null,
  );

  function markDirty() {
    setDirty(true);
    if (update.isError) update.reset();
  }

  function moveChunk(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= chunks.length) return;
    markDirty();
    reorderChunk(index, next);
  }

  function reorderChunk(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= chunks.length) return;
    markDirty();
    setChunks((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      if (!item) return prev;
      copy.splice(to, 0, item);
      return copy;
    });
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
  const update = api.song.update.useMutation();
  const remove = api.song.delete.useMutation({
    onSuccess: () => router.push("/musicas"),
  });
  const mutateUpdateRef = useRef(update.mutateAsync);
  mutateUpdateRef.current = update.mutateAsync;
  const refreshRef = useRef(() => router.refresh());
  refreshRef.current = () => router.refresh();
  const songId = song?.id;

  useEffect(() => {
    if (!songId) return;
    const autosave = createSongAutosave({
      save: async (draft) => {
        await mutateUpdateRef.current({
          id: songId,
          title: draft.title,
          cifraText: draft.cifraText,
          artistId: draft.artistId,
          videoId: draft.videoId,
          chunks: draft.chunks,
        });
        refreshRef.current();
      },
      onStatus: setAutosaveStatus,
    });
    autosaveRef.current = autosave;
    return () => {
      autosave.dispose();
      autosaveRef.current = null;
    };
  }, [songId]);

  useEffect(() => {
    if (!songId || !dirty) return;
    autosaveRef.current?.notify({
      title,
      cifraText,
      artistId: artistId || undefined,
      videoId: parseYoutubeVideoId(videoId) || undefined,
      chunks: chunks.map(({ text }) => ({ text })),
      cifraOk: preview.ok,
    });
  }, [songId, dirty, title, cifraText, artistId, videoId, chunks, preview.ok]);

  const pending = create.isPending || update.isPending || remove.isPending;
  const error =
    create.error?.message ??
    (autosaveStatus === "error" ? update.error?.message : undefined) ??
    remove.error?.message;
  const saveStatus =
    song && autosaveStatus === "saving"
      ? "Salvando…"
      : song && autosaveStatus === "error"
        ? "Erro ao salvar"
        : song && autosaveStatus === "saved"
          ? "Salvo"
          : null;

  const editTabs = song ? (
    <div
      role="tablist"
      aria-label="Edição da música"
      className="inline-flex w-fit shrink-0 rounded-full bg-[#f0f0ec] p-0.5"
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
  ) : null;

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
          autosaveRef.current?.notify({
            ...payload,
            chunks: chunks.map(({ text }) => ({ text })),
            cifraOk: preview.ok,
          });
          autosaveRef.current?.flush();
        } else {
          create.mutate(payload);
        }
      }}
    >
      {song ? (
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar música
          </h1>
          {saveStatus ? (
            <p
              className={`text-sm ${
                autosaveStatus === "error" ? "text-accent" : "text-muted"
              }`}
              aria-live="polite"
            >
              {saveStatus}
            </p>
          ) : null}
        </div>
      ) : null}
      <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
        Título
        <input
          required
          value={title}
          onChange={(event) => {
            markDirty();
            setTitle(event.target.value);
          }}
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
      </label>
      {artists.length > 0 ? (
        <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
          Artista (opcional)
          <select
            value={artistId}
            onChange={(event) => {
              markDirty();
              setArtistId(event.target.value);
            }}
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
          onChange={(event) => {
            markDirty();
            setVideoId(event.target.value);
          }}
          placeholder="ID do vídeo ou URL"
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
        />
        <span className="font-normal text-muted">
          Cole o id do vídeo (ex.: dQw4w9WgXcQ) ou a URL completa.
        </span>
      </label>
      {editTabs ? <div className="flex justify-end">{editTabs}</div> : null}
      {!song || tab === "cifra" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Cifra
            <textarea
              required
              value={cifraText}
              onChange={(event) => {
                markDirty();
                setCifraText(event.target.value);
              }}
              rows={16}
              spellCheck={false}
              placeholder={"Am          C\nLetra na linha de baixo"}
              className="min-h-[20rem] flex-1 rounded-lg border border-line bg-[#fafafa] px-3 py-2 font-mono text-sm font-normal leading-relaxed"
            />
          </label>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Prévia</p>
            <section className="rounded-[10px] border border-line bg-paper p-4">
              {preview.ok ? (
                <CifraView lines={preview.lines} />
              ) : (
                <p className="text-sm text-accent">
                  Não foi possível ler a Cifra. Cole no formato acordes acima
                  da letra.
                </p>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chunks.map((chunk, index) => (
            <div
              key={chunk.key}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragIndex === null || dragIndex === index) return;
                reorderChunk(dragIndex, index);
                setDragIndex(index);
              }}
              className={`flex flex-col gap-2 rounded-[10px] border border-line bg-paper p-4 ${
                dragIndex === index ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  draggable
                  aria-label="Arrastar trecho"
                  title="Arrastar"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                    setDragIndex(index);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className="cursor-grab touch-none text-muted hover:text-ink active:cursor-grabbing"
                >
                  <IconGrip className="size-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Subir"
                    title="Subir"
                    onClick={() => moveChunk(index, -1)}
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-muted hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
                  >
                    <IconArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descer"
                    title="Descer"
                    onClick={() => moveChunk(index, 1)}
                    disabled={index === chunks.length - 1}
                    className="rounded-md p-1.5 text-muted hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
                  >
                    <IconArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remover"
                    title="Remover"
                    onClick={() => {
                      if (window.confirm("Remover este Trecho?")) {
                        markDirty();
                        setChunks(chunks.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-md p-1.5 text-accent hover:bg-[#f0f0ec]"
                  >
                    <IconTrash className="size-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={chunk.text}
                onChange={(event) => {
                  markDirty();
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
            onClick={() => {
              markDirty();
              setChunks([...chunks, { key: newChunkKey(), text: "" }]);
            }}
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
