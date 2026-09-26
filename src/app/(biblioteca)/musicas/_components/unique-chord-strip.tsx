"use client";

import { ChordDiagramPopover } from "~/app/(biblioteca)/musicas/_components/chord-diagram-popover";

export function UniqueChordStrip({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div
      role="list"
      className="flex max-w-[min(100%,18rem)] gap-1.5 overflow-x-auto pb-0.5"
    >
      {names.map((name) => (
        <div key={name} role="listitem" className="shrink-0">
          <ChordDiagramPopover displayedName={name} />
        </div>
      ))}
    </div>
  );
}
