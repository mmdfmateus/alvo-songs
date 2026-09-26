"use client";

import { useMemo, useState, type ReactNode } from "react";

import { CifraTabTools } from "~/app/(biblioteca)/musicas/_components/cifra-tab-tools";
import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import { UniqueChordStrip } from "~/app/(biblioteca)/musicas/_components/unique-chord-strip";
import { cifraViewLines, uniqueDisplayedChords } from "~/lib/cifra";
import { transposeCifra } from "~/lib/cifra-parse";

type ReadTab = "cifra" | "letra" | "listen";

export function SongReadTabs({
  cifra,
  letra,
  videoId,
}: {
  cifra: unknown;
  letra: string;
  videoId?: string | null;
}) {
  const [tab, setTab] = useState<ReadTab>("cifra");
  const [semitones, setSemitones] = useState(0);

  const cifraLines = useMemo(
    () => cifraViewLines(transposeCifra(cifra, semitones)),
    [cifra, semitones],
  );
  const uniqueNames = uniqueDisplayedChords(cifraLines);

  const tablist = (
    <div
      role="tablist"
      aria-label="Leitura da música"
      className="inline-flex rounded-full bg-[#f0f0ec] p-0.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === "cifra"}
        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
          tab === "cifra" ? "bg-ink text-white" : "text-muted-foreground"
        }`}
        onClick={() => setTab("cifra")}
      >
        Cifra
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "letra"}
        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
          tab === "letra" ? "bg-ink text-white" : "text-muted-foreground"
        }`}
        onClick={() => setTab("letra")}
      >
        Letra
      </button>
      {videoId ? (
        <button
          type="button"
          role="tab"
          aria-selected={tab === "listen"}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            tab === "listen" ? "bg-ink text-white" : "text-muted-foreground"
          }`}
          onClick={() => setTab("listen")}
        >
          Escutar
        </button>
      ) : null}
    </div>
  );

  let body: ReactNode;
  if (tab === "cifra") {
    body = (
      <CifraTabTools
        tablist={tablist}
        tom={{
          semitones,
          onLower: () => setSemitones((value) => value - 1),
          onRaise: () => setSemitones((value) => value + 1),
          onReset: () => setSemitones(0),
        }}
        acordes={
          uniqueNames.length > 0 ? (
            <UniqueChordStrip names={uniqueNames} />
          ) : undefined
        }
        sheet={<CifraView lines={cifraLines} interactiveChords />}
      />
    );
  } else {
    body = (
      <div>
        <div className="mb-4">{tablist}</div>
        {tab === "letra" ? (
          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
            {letra || "Sem letra derivada desta Cifra."}
          </pre>
        ) : videoId ? (
          <iframe
            title="Escutar"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full max-w-2xl rounded-[10px] border-0"
          />
        ) : null}
      </div>
    );
  }

  return body;
}
