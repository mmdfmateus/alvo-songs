"use client";

import { useState } from "react";

import { GuitarFretboard } from "~/app/(biblioteca)/musicas/_components/guitar-fretboard";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  cycleVoicingIndex,
  voicingsForDisplayedChord,
} from "~/lib/chord-voicings";
import { cn } from "~/lib/utils";

export function ChordDiagramPopover({
  displayedName,
  className,
}: {
  displayedName: string;
  className?: string;
}) {
  const voicings = voicingsForDisplayedChord(displayedName);
  const [voicingIndex, setVoicingIndex] = useState(0);
  const voicing = voicings[voicingIndex];

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setVoicingIndex(0);
      }}
    >
      <PopoverTrigger
        className={cn(
          "shrink-0 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-accent",
          className,
        )}
      >
        {displayedName}
      </PopoverTrigger>
      <PopoverContent className="flex w-44 flex-col items-center gap-2">
        <PopoverTitle>{displayedName}</PopoverTitle>
        {voicing ? (
          <GuitarFretboard frets={voicing.frets} label={displayedName} />
        ) : (
          <p className="text-muted-foreground text-center text-sm">
            Sem diagrama para este acorde.
          </p>
        )}
        {voicings.length > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVoicingIndex((index) =>
                cycleVoicingIndex(voicings.length, index),
              )
            }
          >
            Variar
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
