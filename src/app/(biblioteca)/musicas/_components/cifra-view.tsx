"use client";

import { CifraChordDialog } from "~/app/(biblioteca)/musicas/_components/cifra-chord-dialog";
import type { CifraViewLine } from "~/lib/cifra";

export function CifraView({
  lines,
  interactiveChords = false,
}: {
  lines: CifraViewLine[];
  interactiveChords?: boolean;
}) {
  return (
    <div className="font-mono text-[15px] leading-tight sm:text-base">
      {lines.map((line, lineIndex) =>
        line.parts.length === 0 ? (
          <div key={lineIndex} className="h-4" />
        ) : (
          <div key={lineIndex} className="mb-1 overflow-x-auto">
            <div className="inline-flex flex-nowrap items-end">
              {line.parts.map((part, partIndex) => (
                <span
                  key={partIndex}
                  className="inline-flex flex-col whitespace-pre"
                >
                  <span className="min-h-[1.15em] font-semibold text-accent">
                    {interactiveChords && part.chords.trim() ? (
                      <CifraChordDialog displayedName={part.chords} />
                    ) : (
                      (part.chords || " ")
                    )}
                  </span>
                  <span>{part.lyrics || " "}</span>
                </span>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
