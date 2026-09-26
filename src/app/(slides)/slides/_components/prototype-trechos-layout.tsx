"use client";

// PROTOTYPE — throwaway. Not production. Round 2.
// Question: the Trechos editor stays hidden until Editar trechos. How does it appear?
// Three variants on /slides/[id]/editar?variant= — inline, sheet, dialog.
// In-memory only. Does not save the Song.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

import {
  PROTOTYPE_VARIANTS,
  type PrototypeVariant,
} from "~/app/(slides)/slides/_components/prototype-trechos-variant";

export {
  PROTOTYPE_VARIANTS,
  parsePrototypeVariant,
  type PrototypeVariant,
} from "~/app/(slides)/slides/_components/prototype-trechos-variant";

type Lab = {
  activeSongId: string | null;
  bySong: Record<string, { title: string; texts: string[] }>;
  editing: boolean;
  ensure: (songId: string, title: string, serverTexts: string[]) => void;
  open: () => void;
  close: () => void;
  setText: (songId: string, index: number, text: string) => void;
  add: (songId: string) => void;
  remove: (songId: string, index: number) => void;
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
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [bySong, setBySong] = useState<
    Record<string, { title: string; texts: string[] }>
  >({});
  const [editing, setEditing] = useState(false);

  const lab = useMemo<Lab>(
    () => ({
      activeSongId,
      bySong,
      editing,
      ensure(songId, title, serverTexts) {
        setActiveSongId(songId);
        setBySong((prev) =>
          prev[songId]
            ? prev
            : { ...prev, [songId]: { title, texts: serverTexts } },
        );
      },
      open() {
        setEditing(true);
      },
      close() {
        setEditing(false);
      },
      setText(songId, at, text) {
        setBySong((prev) => {
          const song = prev[songId];
          if (!song) return prev;
          const texts = song.texts.map((current, i) => (i === at ? text : current));
          return { ...prev, [songId]: { ...song, texts } };
        });
      },
      add(songId) {
        setBySong((prev) => {
          const song = prev[songId];
          if (!song) return prev;
          return {
            ...prev,
            [songId]: { ...song, texts: [...song.texts, ""] },
          };
        });
      },
      remove(songId, at) {
        setBySong((prev) => {
          const song = prev[songId];
          if (!song) return prev;
          return {
            ...prev,
            [songId]: {
              ...song,
              texts: song.texts.filter((_, i) => i !== at),
            },
          };
        });
      },
    }),
    [activeSongId, bySong, editing],
  );

  return <LabContext.Provider value={lab}>{children}</LabContext.Provider>;
}

function PrototypeTrechosList({ songId }: { songId: string }) {
  const lab = usePrototypeLab();
  const texts = lab.bySong[songId]?.texts ?? [];

  return (
    <div className="flex flex-col gap-2">
      {texts.map((text, i) => (
        <textarea
          key={i}
          aria-label={`Trecho ${i + 1}`}
          value={text}
          rows={3}
          onChange={(event) => lab.setText(songId, i, event.target.value)}
          className="rounded-lg border border-line bg-[#fafafa] px-3 py-2 text-sm"
        />
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-3 py-1 text-sm font-semibold"
          onClick={() => lab.add(songId)}
        >
          Adicionar trecho
        </button>
        <button
          type="button"
          className="rounded-full border border-line px-3 py-1 text-sm"
          onClick={() => lab.remove(songId, texts.length - 1)}
          disabled={texts.length === 0}
        >
          Remover último
        </button>
      </div>
    </div>
  );
}

export function PrototypeEditButton({
  songId,
  title,
  serverTexts,
}: {
  songId: string;
  title: string;
  serverTexts: string[];
}) {
  const lab = usePrototypeLab();
  const open = lab.editing && lab.activeSongId === songId;

  return (
    <button
      type="button"
      aria-expanded={open}
      className="self-start rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[#fafafa]"
      onClick={() => {
        if (open) {
          lab.close();
          return;
        }
        lab.ensure(songId, title, serverTexts);
        lab.open();
      }}
    >
      {open ? "Fechar trechos" : "Editar trechos"}
    </button>
  );
}

export function PrototypeInlineEditor({ songId }: { songId: string }) {
  const lab = usePrototypeLab();
  if (!lab.editing || lab.activeSongId !== songId) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <p className="text-sm font-medium">Trechos</p>
      <PrototypeTrechosList songId={songId} />
    </div>
  );
}

export function PrototypeReveal({
  variant,
}: {
  variant: "sheet" | "dialog";
}) {
  const lab = usePrototypeLab();
  const songId = lab.activeSongId;
  const song = songId ? lab.bySong[songId] : null;
  const show = lab.editing && Boolean(songId && song);

  if (variant === "sheet") {
    return (
      <Sheet open={show} onOpenChange={(next) => { if (!next) lab.close(); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Trechos</SheetTitle>
            <SheetDescription>{song?.title}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            {songId ? <PrototypeTrechosList songId={songId} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!show || !songId || !song) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => lab.close()}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-[10px] border border-line bg-paper p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">Trechos · {song.title}</h2>
          <button
            type="button"
            className="text-sm font-semibold"
            onClick={() => lab.close()}
          >
            Fechar
          </button>
        </div>
        <PrototypeTrechosList songId={songId} />
      </div>
    </div>
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

  const active = lab.activeSongId ? lab.bySong[lab.activeSongId] : null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-2">
      <pre className="max-h-40 overflow-auto rounded-xl bg-black/90 px-3 py-2 text-xs text-white">
        {JSON.stringify(
          {
            variant,
            songId: lab.activeSongId,
            title: active?.title ?? null,
            texts: active?.texts ?? [],
            editing: lab.editing,
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
