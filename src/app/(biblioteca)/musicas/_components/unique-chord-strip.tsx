"use client";

import { ChordDiagramPopover } from "~/app/(biblioteca)/musicas/_components/chord-diagram-popover";

const acordesSummaryClassName =
  "flex min-h-11 cursor-pointer list-none items-center rounded-full border border-line bg-paper px-3.5 text-sm font-semibold text-ink marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink [&::-webkit-details-marker]:hidden";

export function UniqueChordStrip({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <details className="mb-4" aria-label="Acordes">
      <summary className={acordesSummaryClassName}>Acordes</summary>
      <div
        role="list"
        className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
      >
        {names.map((name) => (
          <div key={name} role="listitem" className="shrink-0">
            <ChordDiagramPopover displayedName={name} />
          </div>
        ))}
      </div>
    </details>
  );
}
