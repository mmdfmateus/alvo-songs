"use client";

import { GuitarFretboardDiagram } from "~/app/(biblioteca)/musicas/_components/guitar-fretboard-diagram";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { lookupGuitarVoicing } from "~/lib/guitar-voicing";

export function CifraChordDialog({
  displayedName,
}: {
  displayedName: string;
}) {
  const label = displayedName.trim();
  const result = lookupGuitarVoicing(label);

  return (
    <Dialog>
      <DialogTrigger
        className="inline cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-semibold text-accent underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {displayedName}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          {result.ok ? (
            <DialogDescription className="sr-only">
              Diagrama de violão em afinação padrão.
            </DialogDescription>
          ) : (
            <DialogDescription>
              Não há diagrama para este acorde.
            </DialogDescription>
          )}
        </DialogHeader>
        {result.ok ? (
          <GuitarFretboardDiagram label={label} strings={result.strings} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
