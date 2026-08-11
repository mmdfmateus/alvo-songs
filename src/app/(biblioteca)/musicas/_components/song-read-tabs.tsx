"use client";

import { useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import type { CifraViewLine } from "~/lib/cifra";

type ReadTab = "cifra" | "letra" | "listen";

export function SongReadTabs({
  cifraLines,
  letra,
  videoId,
}: {
  cifraLines: CifraViewLine[];
  letra: string;
  videoId?: string | null;
}) {
  const [tab, setTab] = useState<ReadTab>("cifra");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Leitura da música"
        className="mb-4 inline-flex rounded-full bg-[#f0f0ec] p-0.5"
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
          aria-selected={tab === "letra"}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            tab === "letra" ? "bg-ink text-white" : "text-muted"
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
              tab === "listen" ? "bg-ink text-white" : "text-muted"
            }`}
            onClick={() => setTab("listen")}
          >
            Escutar
          </button>
        ) : null}
      </div>
      {tab === "cifra" ? (
        <CifraView lines={cifraLines} />
      ) : tab === "letra" ? (
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
