"use client";

// PROTOTYPE — throwaway. Not production.
// Question: where do Trechos sit while building a Program?
// Three variants on /slides/[id]/editar, switchable via ?variant=
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
  index: number;
  ensure: (songId: string, title: string, serverTexts: string[]) => void;
  setText: (songId: string, index: number, text: string) => void;
  add: (songId: string) => void;
  remove: (songId: string, index: number) => void;
  move: (songId: string, index: number, delta: -1 | 1) => void;
  setIndex: (index: number) => void;
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
  const [index, setIndex] = useState(0);

  const lab = useMemo<Lab>(
    () => ({
      activeSongId,
      bySong,
      index,
      ensure(songId, title, serverTexts) {
        setActiveSongId((current) => {
          if (current !== songId) setIndex(0);
          return songId;
        });
        setBySong((prev) =>
          prev[songId]
            ? prev
            : { ...prev, [songId]: { title, texts: serverTexts } },
        );
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
      move(songId, at, delta) {
        setBySong((prev) => {
          const song = prev[songId];
          if (!song) return prev;
          const next = at + delta;
          if (next < 0 || next >= song.texts.length) return prev;
          const texts = [...song.texts];
          const [item] = texts.splice(at, 1);
          if (item === undefined) return prev;
          texts.splice(next, 0, item);
          return { ...prev, [songId]: { ...song, texts } };
        });
      },
      setIndex,
    }),
    [activeSongId, bySong, index],
  );

  return <LabContext.Provider value={lab}>{children}</LabContext.Provider>;
}

function textsOf(
  lab: Lab,
  songId: string,
  serverTexts: string[],
) {
  return lab.bySong[songId]?.texts ?? serverTexts;
}

export function PrototypeSectionEditor({
  songId,
  title,
  serverTexts,
}: {
  songId: string;
  title: string;
  serverTexts: string[];
}) {
  const lab = usePrototypeLab();
  const seed = serverTexts.join("\n");
  useEffect(() => {
    lab.ensure(songId, title, seed === "" ? [] : seed.split("\n"));
    // lab.ensure identity changes when drafts change; re-seeding would reset the slide.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId, title, seed]);

  const texts = textsOf(lab, songId, serverTexts);

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <p className="text-sm font-medium">Trechos</p>
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

export function PrototypePaneEditor() {
  const lab = usePrototypeLab();
  const song = lab.activeSongId ? lab.bySong[lab.activeSongId] : null;

  if (!song || !lab.activeSongId) {
    return (
      <p className="text-muted-foreground">
        Escolha uma música. Os trechos abrem aqui, no lugar da prévia.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{song.title}</h2>
      {song.texts.map((text, i) => (
        <label key={i} className="flex flex-col gap-1 text-sm font-medium">
          Trecho {i + 1}
          <textarea
            value={text}
            rows={4}
            onChange={(event) =>
              lab.setText(lab.activeSongId!, i, event.target.value)
            }
            className="rounded-lg border border-line bg-paper px-3 py-2 font-normal"
          />
          <span className="flex gap-2 font-normal">
            <button type="button" onClick={() => lab.move(lab.activeSongId!, i, -1)}>
              Subir
            </button>
            <button type="button" onClick={() => lab.move(lab.activeSongId!, i, 1)}>
              Descer
            </button>
            <button type="button" onClick={() => lab.remove(lab.activeSongId!, i)}>
              Remover
            </button>
          </span>
        </label>
      ))}
      <button
        type="button"
        className="self-start rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
        onClick={() => lab.add(lab.activeSongId!)}
      >
        Adicionar trecho
      </button>
    </div>
  );
}

export function PrototypeSlideEditor() {
  const lab = usePrototypeLab();
  const song = lab.activeSongId ? lab.bySong[lab.activeSongId] : null;

  if (!song || !lab.activeSongId) {
    return (
      <p className="text-muted-foreground">
        Escolha uma música para editar um slide de cada vez.
      </p>
    );
  }

  const at = Math.min(lab.index, Math.max(song.texts.length - 1, 0));
  const text = song.texts[at] ?? "";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {song.title} · slide {song.texts.length === 0 ? 0 : at + 1} de{" "}
        {song.texts.length}
      </p>
      <div
        className="flex aspect-video flex-col items-center justify-center rounded-[10px] border border-line p-8"
        style={{ background: "#F1F0F0", color: "#343434" }}
      >
        <textarea
          aria-label="Texto do slide"
          value={text}
          onChange={(event) => lab.setText(lab.activeSongId!, at, event.target.value)}
          className="w-full resize-none bg-transparent text-center text-2xl leading-snug outline-none"
          style={{ fontFamily: "var(--font-slide-cardo), Cardo, serif" }}
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold"
          onClick={() => lab.setIndex(Math.max(0, at - 1))}
        >
          Anterior
        </button>
        <button
          type="button"
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold"
          onClick={() => lab.setIndex(Math.min(song.texts.length - 1, at + 1))}
        >
          Próximo
        </button>
        <button
          type="button"
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold"
          onClick={() => {
            lab.add(lab.activeSongId!);
            lab.setIndex(song.texts.length);
          }}
        >
          Novo slide
        </button>
      </div>
    </div>
  );
}

export function PrototypeSeed({
  songId,
  title,
  serverTexts,
}: {
  songId: string;
  title: string;
  serverTexts: string[];
}) {
  const lab = usePrototypeLab();
  const seed = serverTexts.join("\n");
  useEffect(() => {
    lab.ensure(songId, title, seed === "" ? [] : seed.split("\n"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId, title, seed]);
  return null;
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
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-2">
      <pre className="max-h-40 overflow-auto rounded-xl bg-black/90 px-3 py-2 text-xs text-white">
        {JSON.stringify(
          {
            variant,
            songId: lab.activeSongId,
            title: active?.title ?? null,
            texts: active?.texts ?? [],
            slideIndex: lab.index,
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
