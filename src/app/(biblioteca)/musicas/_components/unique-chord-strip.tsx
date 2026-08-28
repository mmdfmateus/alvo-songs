"use client";

import { ChordDiagramPopover } from "~/app/(biblioteca)/musicas/_components/chord-diagram-popover";

export function UniqueChordStrip({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div
      role="list"
      aria-label="Acordes"
      className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
    >
      {names.map((name) => (
        <div key={name} role="listitem" className="shrink-0">
          <ChordDiagramPopover displayedName={name} />
        </div>
      ))}
    </div>
  );
}
