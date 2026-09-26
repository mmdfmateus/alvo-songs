"use client";

import { useSearchParams } from "next/navigation";

import { SongReadTabs } from "~/app/(biblioteca)/musicas/_components/song-read-tabs";
import type { CifraToolVariant } from "~/app/(biblioteca)/musicas/_components/cifra-tools.prototype";

function isToolVariant(value: string | null): value is CifraToolVariant {
  return value === "A" || value === "B" || value === "C";
}

/** PROTOTYPE host — reads ?variant= on the Song Cifra tab. */
export function SongReadTabsPrototypeHost({
  cifra,
  letra,
  videoId,
}: {
  cifra: unknown;
  letra: string;
  videoId?: string | null;
}) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("variant");
  const variant: CifraToolVariant = isToolVariant(raw) ? raw : "A";

  return (
    <SongReadTabs
      cifra={cifra}
      letra={letra}
      videoId={videoId}
      prototypeVariant={variant}
    />
  );
}
