"use client";

import { useMemo, useState } from "react";

import { CifraView } from "~/app/(biblioteca)/musicas/_components/cifra-view";
import {
  CIFRA_TOOL_VARIANT_NAMES,
  VariantA,
  VariantB,
  VariantC,
  type CifraToolVariant,
} from "~/app/(biblioteca)/musicas/_components/cifra-tools.prototype";
import { PrototypeSwitcher } from "~/app/_components/prototype-switcher";
import { cifraViewLines } from "~/lib/cifra";
import { transposeCifra } from "~/lib/cifra-parse";

type ReadTab = "cifra" | "letra" | "listen";

export function SongReadTabs({
  cifra,
  letra,
  videoId,
  prototypeVariant,
}: {
  cifra: unknown;
  letra: string;
  videoId?: string | null;
  prototypeVariant?: CifraToolVariant;
}) {
  const [tab, setTab] = useState<ReadTab>("cifra");
  const [semitones, setSemitones] = useState(0);

  const cifraLines = useMemo(
    () => cifraViewLines(transposeCifra(cifra, semitones)),
    [cifra, semitones],
  );

  const tom = {
    semitones,
    onLower: () => setSemitones((value) => value - 1),
    onRaise: () => setSemitones((value) => value + 1),
    onReset: () => setSemitones(0),
  };

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

  const sheet = <CifraView lines={cifraLines} />;
  const prototypeOn = Boolean(prototypeVariant);

  if (tab !== "cifra") {
    return (
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
        {prototypeOn ? (
          <PrototypeSwitcher
            variants={["A", "B", "C"]}
            names={{ ...CIFRA_TOOL_VARIANT_NAMES }}
          />
        ) : null}
      </div>
    );
  }

  if (!prototypeOn) {
    return (
      <div>
        <div className="mb-4">{tablist}</div>
        <CifraView lines={cifraLines} tom={tom} />
      </div>
    );
  }

  return (
    <div>
      {prototypeVariant === "B" ? (
        <VariantB tablist={tablist} lines={cifraLines} tom={tom} sheet={sheet} />
      ) : (
        <>
          <div className="mb-4">{tablist}</div>
          {prototypeVariant === "C" ? (
            <VariantC lines={cifraLines} tom={tom} sheet={sheet} />
          ) : (
            <VariantA lines={cifraLines} tom={tom} sheet={sheet} />
          )}
        </>
      )}
      <PrototypeSwitcher
        variants={["A", "B", "C"]}
        names={{ ...CIFRA_TOOL_VARIANT_NAMES }}
      />
    </div>
  );
}
