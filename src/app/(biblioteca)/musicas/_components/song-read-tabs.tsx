"use client";

import { useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import type { CifraViewLine } from "~/lib/cifra";

export function SongReadTabs({
  cifraLines,
  letra,
}: {
  cifraLines: CifraViewLine[];
  letra: string;
}) {
  const [tab, setTab] = useState<"cifra" | "letra">("cifra");

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
      </div>
      {tab === "cifra" ? (
        <CifraView lines={cifraLines} />
      ) : (
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
          {letra || "Sem letra derivada desta Cifra."}
        </pre>
      )}
    </div>
  );
}
