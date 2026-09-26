"use client";

// PROTOTYPE — throwaway. Not production.
// Question: how should an Editor open the Trechos sheet?
// In-memory only. Does not save the Song.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { TrechosEditor, type TrechoDraft } from "~/app/_components/trechos-editor";
import {
  PROTOTYPE_VARIANTS,
  type PrototypeVariant,
} from "~/app/(slides)/slides/_components/prototype-trechos-button-variant";
import { SlidePreview } from "~/app/(slides)/slides/_components/slide-preview";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { BLANK_SLIDE_COUNT, type Slide } from "~/lib/slides";
import type { SlideThemeId } from "~/lib/slide-theme";
import { api } from "~/trpc/react";

type SongDraft = { title: string; chunks: TrechoDraft[] };

type Lab = {
  openSongId: string | null;
  bySong: Record<string, SongDraft>;
  open: (songId: string, fallbackTitle: string) => void;
  close: () => void;
  setChunks: (songId: string, chunks: TrechoDraft[]) => void;
};

const LabContext = createContext<Lab | null>(null);

export function usePrototypeLab() {
  const lab = useContext(LabContext);
  if (!lab) throw new Error("Prototype lab missing");
  return lab;
}

export function usePrototypeLabOptional() {
  return useContext(LabContext);
}

export function PrototypeLab({ children }: { children: ReactNode }) {
  const utils = api.useUtils();
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const [bySong, setBySong] = useState<Record<string, SongDraft>>({});

  const lab = useMemo<Lab>(
    () => ({
      openSongId,
      bySong,
      open(songId, fallbackTitle) {
        const cached = utils.song.byId.getData({ id: songId });
        setBySong((prev) =>
          prev[songId]
            ? prev
            : {
                ...prev,
                [songId]: {
                  title: cached?.title ?? fallbackTitle,
                  chunks: (cached?.chunks ?? []).map((chunk) => ({
                    key: chunk.id,
                    text: chunk.text,
                  })),
                },
              },
        );
        setOpenSongId(songId);
      },
      close() {
        setOpenSongId(null);
      },
      setChunks(songId, chunks) {
        setBySong((prev) => {
          const song = prev[songId];
          if (!song) return prev;
          return { ...prev, [songId]: { ...song, chunks } };
        });
      },
    }),
    [bySong, openSongId, utils.song.byId],
  );

  return <LabContext.Provider value={lab}>{children}</LabContext.Provider>;
}

export function PrototypePillButton({
  songId,
  title,
}: {
  songId: string;
  title: string;
}) {
  const lab = usePrototypeLab();
  const open = lab.openSongId === songId;

  return (
    <button
      type="button"
      aria-expanded={open}
      className="self-start rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
      onClick={() => (open ? lab.close() : lab.open(songId, title))}
    >
      {open ? "Fechar trechos" : "Editar trechos"}
    </button>
  );
}

export function PrototypeToolbarButton({
  songId,
  title,
}: {
  songId: string | null;
  title: string;
}) {
  const lab = usePrototypeLab();
  const open = Boolean(songId) && lab.openSongId === songId;

  return (
    <button
      type="button"
      aria-label="Editar trechos"
      title="Editar trechos"
      aria-expanded={open}
      disabled={!songId}
      className="rounded-md p-1.5 text-muted-foreground hover:bg-[#f0f0ec] hover:text-ink disabled:opacity-40"
      onClick={() => {
        if (!songId) return;
        if (open) lab.close();
        else lab.open(songId, title);
      }}
    >
      <Pencil className="size-4" />
    </button>
  );
}

export function PrototypeSheet() {
  const lab = usePrototypeLab();
  const songId = lab.openSongId;
  const song = songId ? lab.bySong[songId] : null;

  return (
    <Sheet
      open={Boolean(songId && song)}
      onOpenChange={(next) => {
        if (!next) lab.close();
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-paper text-ink sm:max-w-xl"
      >
        <SheetHeader className="pr-10">
          <SheetTitle className="text-ink">{song?.title}</SheetTitle>
        </SheetHeader>
        {songId && song ? (
          <div className="flex flex-col gap-2 px-4 pb-6">
            <p className="text-sm font-medium">Trechos</p>
            <TrechosEditor
              chunks={song.chunks}
              onChange={(chunks) => lab.setChunks(songId, chunks)}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function PrototypeMarkedPreview({
  sections,
  slides,
  themeId,
  librarySongs,
}: {
  sections: { type: string; songId?: string | null }[];
  slides: Slide[];
  themeId: SlideThemeId;
  librarySongs: { id: string; title: string }[];
}) {
  const lab = usePrototypeLab();
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
  const queryById = new Map(songIds.map((id, index) => [id, songQueries[index]]));

  const marks: { index: number; onEdit: () => void }[] = [];
  let slideIndex = 0;
  for (const section of sections) {
    if (section.type === "opening" || section.type === "moment") {
      slideIndex += 1;
      continue;
    }
    if (section.type === "announcements" || section.type === "game") {
      slideIndex += 1 + BLANK_SLIDE_COUNT;
      continue;
    }
    if (section.type !== "song" || !section.songId) continue;
    const query = queryById.get(section.songId);
    const listed = librarySongs.find((song) => song.id === section.songId);
    const loaded = query?.data;
    const missing = query?.isFetched && query.data == null;
    if (missing) continue;
    if (!loaded && !listed) continue;
    const songId = section.songId;
    const title = lab.bySong[songId]?.title ?? loaded?.title ?? listed?.title ?? "Música";
    const chunkCount =
      lab.bySong[songId]?.chunks.length ?? loaded?.chunks.length ?? 0;
    const at = slideIndex;
    marks.push({
      index: at,
      onEdit: () =>
        lab.openSongId === songId ? lab.close() : lab.open(songId, title),
    });
    slideIndex += 1 + chunkCount;
  }

  return (
    <SlidePreview
      slides={slides}
      themeId={themeId}
      editMarks={marks}
    />
  );
}

export function PrototypeSwitcher({
  programId,
  variant,
}: {
  programId: string;
  variant: PrototypeVariant;
}) {
  const router = useRouter();
  const lab = usePrototypeLab();
  const current = PROTOTYPE_VARIANTS.findIndex((item) => item.id === variant);
  const meta = PROTOTYPE_VARIANTS[current] ?? PROTOTYPE_VARIANTS[0];
  const active = lab.openSongId ? lab.bySong[lab.openSongId] : null;

  function go(delta: number) {
    const count = PROTOTYPE_VARIANTS.length;
    const next = PROTOTYPE_VARIANTS[(current + delta + count) % count]!;
    router.replace(`/slides/${programId}/editar?variant=${next.id}`);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-2">
      <pre className="max-h-40 overflow-auto rounded-xl bg-black/90 px-3 py-2 text-xs text-white">
        {JSON.stringify(
          {
            variant,
            songId: lab.openSongId,
            title: active?.title ?? null,
            texts: active?.chunks.map((chunk) => chunk.text) ?? [],
          },
          null,
          2,
        )}
      </pre>
      <div className="flex items-center justify-center gap-3 rounded-full bg-black px-3 py-2 text-sm text-white shadow-lg">
        <button type="button" aria-label="Variante anterior" onClick={() => go(-1)}>
          ←
        </button>
        <span>
          {meta.id} ({meta.name})
        </span>
        <button type="button" aria-label="Próxima variante" onClick={() => go(1)}>
          →
        </button>
      </div>
    </div>
  );
}
