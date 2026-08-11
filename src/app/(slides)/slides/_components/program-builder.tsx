"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ExportPdfButton,
  ExportPdfHint,
} from "~/app/(slides)/slides/_components/export-pdf-button";
import { SlidePreview } from "~/app/(slides)/slides/_components/slide-preview";
import { removeMyProgram, renameMyProgram } from "~/lib/my-programs";
import {
  createProgramAutosave,
  type ProgramAutosaveDraft,
  type ProgramAutosaveStatus,
} from "~/lib/program-autosave";
import { clearOwnerTokenFromDocument } from "~/lib/program-owners-cookie";
import {
  DEFAULT_COMMUNITY_NAME,
  expandSections,
  resolveLivePreviewSong,
} from "~/lib/slides";
import { api } from "~/trpc/react";

type DraftSection =
  | {
      key: string;
      type: "opening";
      payload: { communityName: string; subtitle: string };
    }
  | {
      key: string;
      type: "announcements" | "game" | "moment";
      payload: { title: string };
    }
  | {
      key: string;
      type: "song";
      songId: string | null;
    };

const TYPE_LABEL: Record<DraftSection["type"], string> = {
  opening: "Abertura",
  song: "Música",
  announcements: "Recados",
  game: "Brincadeira",
  moment: "Momento",
};

function newKey() {
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

function IconPublicLink({ className }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function sectionsFromProgram(
  sections: {
    id?: string;
    type: string;
    payload: unknown;
    songId?: string | null;
  }[],
): DraftSection[] {
  return sections.flatMap((section): DraftSection[] => {
    const key = section.id ?? newKey();
    if (section.type === "opening") {
      const payload = (section.payload ?? {}) as {
        communityName?: string;
        subtitle?: string;
      };
      return [
        {
          key,
          type: "opening",
          payload: {
            communityName: payload.communityName ?? DEFAULT_COMMUNITY_NAME,
            subtitle: payload.subtitle ?? "",
          },
        },
      ];
    }
    if (section.type === "song") {
      return [{ key, type: "song", songId: section.songId ?? null }];
    }
    if (
      section.type === "announcements" ||
      section.type === "game" ||
      section.type === "moment"
    ) {
      const payload = (section.payload ?? {}) as { title?: string };
      return [
        {
          key,
          type: section.type,
          payload: { title: payload.title ?? "" },
        },
      ];
    }
    return [];
  });
}

function toInput(sections: DraftSection[]): ProgramAutosaveDraft["sections"] {
  return sections.map((section) => {
    if (section.type === "opening") {
      return {
        type: "opening" as const,
        payload: {
          communityName: section.payload.communityName,
          ...(section.payload.subtitle.trim()
            ? { subtitle: section.payload.subtitle.trim() }
            : {}),
        },
      };
    }
    if (section.type === "song") {
      return {
        type: "song" as const,
        songId: section.songId,
        payload: {},
      };
    }
    return {
      type: section.type,
      payload: { title: section.payload.title },
    };
  });
}

function SongPicker({
  songId,
  songs,
  onChange,
}: {
  songId: string | null;
  songs: { id: string; title: string }[];
  onChange: (songId: string | null) => void;
}) {
  const detail = api.song.byId.useQuery(
    { id: songId ?? "" },
    { enabled: Boolean(songId) },
  );
  const missingFromLibrary =
    Boolean(songId) && detail.isFetched && detail.data === null;

  return (
    <div className="flex flex-col gap-2">
      <select
        aria-label="Música"
        value={songId ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
      >
        <option value="">Escolher música</option>
        {songId && !songs.some((song) => song.id === songId) ? (
          <option value={songId}>Música não encontrada</option>
        ) : null}
        {songs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title}
          </option>
        ))}
      </select>
      {missingFromLibrary ? (
        <p className="text-sm text-accent">
          Música não encontrada na Biblioteca
        </p>
      ) : null}
      {!songId ? (
        <p className="text-sm text-muted">Escolha uma música da Biblioteca.</p>
      ) : null}
    </div>
  );
}

function useLivePreviewSlides(
  sections: DraftSection[],
  librarySongs: { id: string; title: string }[],
) {
  const songIds = [
    ...new Set(
      sections.flatMap((section) =>
        section.type === "song" && section.songId ? [section.songId] : [],
      ),
    ),
  ];
  const songQueries = api.useQueries((t) =>
    songIds.map((id) => t.song.byId({ id })),
  );
  const queryById = new Map(
    songIds.map((id, index) => [id, songQueries[index]]),
  );

  const slides = expandSections(
    sections.map((section) => {
      if (section.type === "song") {
        const query = section.songId ? queryById.get(section.songId) : undefined;
        const listedTitle = librarySongs.find(
          (song) => song.id === section.songId,
        )?.title;
        return {
          type: "song",
          payload: {},
          song: resolveLivePreviewSong(
            section.songId,
            query
              ? { isFetched: query.isFetched, data: query.data }
              : undefined,
            listedTitle,
          ),
        };
      }
      return { type: section.type, payload: section.payload };
    }),
  );
  const songsFetched = songIds.every(
    (id) => queryById.get(id)?.isFetched === true,
  );

  return { slides, songsFetched };
}

export function ProgramBuilder({
  program,
  ownerToken,
}: {
  program: {
    id: string;
    name: string;
    sections: {
      id?: string;
      type: string;
      payload: unknown;
      songId?: string | null;
    }[];
  };
  ownerToken: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(program.name);
  const [sections, setSections] = useState<DraftSection[]>(() =>
    sectionsFromProgram(program.sections),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [autosaveStatus, setAutosaveStatus] =
    useState<ProgramAutosaveStatus>("idle");
  const autosaveRef = useRef<ReturnType<typeof createProgramAutosave> | null>(
    null,
  );
  const library = api.song.list.useQuery();
  const { slides, songsFetched } = useLivePreviewSlides(
    sections,
    library.data ?? [],
  );

  const update = api.program.update.useMutation();
  const remove = api.program.delete.useMutation({
    onSuccess: () => {
      removeMyProgram(program.id);
      clearOwnerTokenFromDocument(program.id);
      router.push("/slides");
    },
  });

  const mutateUpdateRef = useRef(update.mutateAsync);
  mutateUpdateRef.current = update.mutateAsync;
  const refreshRef = useRef(() => router.refresh());
  refreshRef.current = () => router.refresh();
  const renameRef = useRef(renameMyProgram);
  renameRef.current = renameMyProgram;

  useEffect(() => {
    const autosave = createProgramAutosave({
      save: async (draft) => {
        const saved = await mutateUpdateRef.current({
          id: program.id,
          ownerToken,
          name: draft.name,
          sections: draft.sections,
        });
        renameRef.current(saved.id, saved.name);
      },
      onStatus: (status) => {
        setAutosaveStatus(status);
        if (status === "saved") refreshRef.current();
      },
    });
    autosaveRef.current = autosave;
    return () => {
      autosave.dispose();
      autosaveRef.current = null;
    };
  }, [program.id, ownerToken]);

  useEffect(() => {
    if (!dirty) return;
    autosaveRef.current?.notify({
      name,
      sections: toInput(sections),
    });
  }, [dirty, name, sections]);

  function markDirty() {
    setDirty(true);
    if (update.isError) update.reset();
  }

  function reorderSection(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= sections.length) return;
    markDirty();
    setSections((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      if (!item) return prev;
      copy.splice(to, 0, item);
      return copy;
    });
  }

  function move(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= sections.length) return;
    reorderSection(index, next);
  }

  const pending = update.isPending || remove.isPending;
  const error =
    (autosaveStatus === "error" ? update.error?.message : undefined) ??
    remove.error?.message;
  const saveStatus =
    autosaveStatus === "saving"
      ? "Salvando…"
      : autosaveStatus === "error"
        ? "Erro ao salvar"
        : autosaveStatus === "saved"
          ? "Salvo"
          : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar slides
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
        <div className="flex flex-wrap items-center gap-2">
          <ExportPdfButton
            slides={slides}
            programName={name}
            disabled={!songsFetched}
            showHint={false}
          />
          <Link
            href={`/slides/${program.id}`}
            aria-label="Ver link público"
            title="Ver link público"
            className="rounded-md p-1.5 text-muted no-underline hover:bg-[#f0f0ec] hover:text-ink"
          >
            <IconPublicLink className="size-4" />
          </Link>
          <button
            type="button"
            disabled={pending}
            aria-label="Excluir"
            title="Excluir"
            className="rounded-md p-1.5 text-accent hover:bg-[#f0f0ec] disabled:opacity-60"
            onClick={() => {
              if (window.confirm("Excluir estes Slides deste dispositivo?")) {
                remove.mutate({ id: program.id, ownerToken });
              }
            }}
          >
            <IconTrash className="size-4" />
          </button>
        </div>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          autosaveRef.current?.notify({
            name,
            sections: toInput(sections),
          });
          autosaveRef.current?.flush();
        }}
      >
        <label className="flex max-w-md flex-col gap-1 text-sm font-medium">
          Nome
          <input
            required
            value={name}
            onChange={(event) => {
              markDirty();
              setName(event.target.value);
            }}
            className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
          />
        </label>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Seções</h2>
          {sections.map((section, index) => (
            <div
              key={section.key}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragIndex === null || dragIndex === index) return;
                reorderSection(dragIndex, index);
                setDragIndex(index);
              }}
              className={`flex flex-col gap-2 rounded-[10px] border border-line bg-paper p-4 ${
                dragIndex === index ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    draggable
                    aria-label="Arrastar seção"
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
                  <p className="text-sm font-semibold">
                    {TYPE_LABEL[section.type]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Subir"
                    title="Subir"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-muted hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
                  >
                    <IconArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descer"
                    title="Descer"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    className="rounded-md p-1.5 text-muted hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
                  >
                    <IconArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remover"
                    title="Remover"
                    onClick={() => {
                      if (window.confirm("Remover esta seção?")) {
                        markDirty();
                        setSections(sections.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-md p-1.5 text-accent hover:bg-[#f0f0ec]"
                  >
                    <IconTrash className="size-4" />
                  </button>
                </div>
              </div>
              {section.type === "opening" ? (
                <>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Comunidade
                    <input
                      required
                      value={section.payload.communityName}
                      onChange={(event) => {
                        markDirty();
                        const copy = [...sections];
                        copy[index] = {
                          ...section,
                          payload: {
                            ...section.payload,
                            communityName: event.target.value,
                          },
                        };
                        setSections(copy);
                      }}
                      className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Subtítulo (opcional)
                    <input
                      value={section.payload.subtitle}
                      onChange={(event) => {
                        markDirty();
                        const copy = [...sections];
                        copy[index] = {
                          ...section,
                          payload: {
                            ...section.payload,
                            subtitle: event.target.value,
                          },
                        };
                        setSections(copy);
                      }}
                      className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                    />
                  </label>
                </>
              ) : section.type === "song" ? (
                <SongPicker
                  songId={section.songId}
                  songs={library.data ?? []}
                  onChange={(songId) => {
                    markDirty();
                    const copy = [...sections];
                    copy[index] = { ...section, songId };
                    setSections(copy);
                  }}
                />
              ) : (
                <input
                  required
                  aria-label="Título"
                  value={section.payload.title}
                  onChange={(event) => {
                    markDirty();
                    const copy = [...sections];
                    copy[index] = {
                      ...section,
                      payload: { title: event.target.value },
                    };
                    setSections(copy);
                  }}
                  className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm font-normal"
                />
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["opening", "Abertura"],
                ["song", "Música"],
                ["announcements", "Recados"],
                ["game", "Brincadeira"],
                ["moment", "Momento"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
                onClick={() => {
                  markDirty();
                  if (type === "opening") {
                    setSections([
                      ...sections,
                      {
                        key: newKey(),
                        type: "opening",
                        payload: {
                          communityName: DEFAULT_COMMUNITY_NAME,
                          subtitle: "",
                        },
                      },
                    ]);
                    return;
                  }
                  if (type === "song") {
                    setSections([
                      ...sections,
                      { key: newKey(), type: "song", songId: null },
                    ]);
                    return;
                  }
                  setSections([
                    ...sections,
                    {
                      key: newKey(),
                      type,
                      payload: { title: label },
                    },
                  ]);
                }}
              >
                + {label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-accent">{error}</p> : null}
      </form>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Prévia</h2>
        <div className="mb-6">
          <ExportPdfHint />
        </div>
        <SlidePreview slides={slides} />
      </section>
    </div>
  );
}
